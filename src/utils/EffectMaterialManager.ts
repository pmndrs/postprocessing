import { Event as Event3, SRGBColorSpace, Texture } from "three";
import { Disposable } from "../core/Disposable.js";
import { Effect } from "../effects/Effect.js";
import { EffectShaderSection as Section } from "../enums/EffectShaderSection.js";
import { GBufferConfig } from "./GBufferConfig.js";
import { EffectShaderData } from "./EffectShaderData.js";
import { EffectMaterial } from "../materials/EffectMaterial.js";
import { Pass } from "../core/Pass.js";
import { ShaderData } from "../core/ShaderData.js";

/**
 * An effect material manager that creates, updates and caches effect shader combinations.
 *
 * @category Utils
 * @internal
 */

export class EffectMaterialManager implements Disposable {

	/**
	 * The maximum number of optional effects.
	 *
	 * If there are too many optional effects, materials will not be created ahead of time.
	 */

	static readonly MAX_OPTIONAL_EFFECTS = 6;

	/**
	 * A collection of shader data that will be applied to new materials.
	 */

	private readonly shaderData: ShaderData;

	/**
	 * A collection that maps effects to extracted shader data for integration into materials.
	 */

	private readonly effectShaderDataCache: Map<Effect, EffectShaderData>;

	/**
	 * A collection that maps combined effect IDs to effect materials.
	 */

	private readonly materialCache: Map<string, EffectMaterial>;

	/**
	 * An event listener that calls {@link invalidateShaderData}.
	 */

	private readonly changeListener: (e: Event3) => void;

	// #region Backing Data

	/**
	 * @see {@link effects}
	 */

	private _effects: Effect[];

	/**
	 * @see {@link gBufferConfig}
	 */

	private _gBufferConfig: GBufferConfig | null;

	/**
	 * @see {@link dithering}
	 */

	private _dithering: boolean;

	/**
	 * @see {@link gBuffer}
	 */

	private _gBuffer: Record<string, Texture | null> | null;

	// #endregion

	/**
	 * Constructs a new effect material manager.
	 *
	 * @param shaderData - A collection of shader data that will be applied to new materials.
	 */

	constructor(shaderData: ShaderData) {

		this.shaderData = shaderData;
		this.effectShaderDataCache = new Map<Effect, EffectShaderData>();
		this.materialCache = new Map<string, EffectMaterial>();
		this.changeListener = (e: Event3) => this.effectShaderDataCache.delete(e.target as Effect);

		this._effects = [];
		this._gBufferConfig = null;
		this._dithering = false;
		this._gBuffer = null;

	}

	/**
	 * The current materials.
	 */

	get materials(): Iterable<EffectMaterial> {

		return this.materialCache.values();

	}

	/**
	 * The current effects.
	 *
	 * Assigning new effects will invalidate all caches.
	 */

	get effects(): Effect[] {

		return this._effects;

	}

	set effects(value: Effect[]) {

		this.dispose();
		this._effects = value;

		for(const effect of this._effects) {

			effect.addEventListener(Pass.EVENT_CHANGE, this.changeListener);

		}

	}

	/**
	 * The current G-Buffer configuration.
	 *
	 * Assigning a new configuration will invalidate all caches.
	 */

	get gBufferConfig(): GBufferConfig | null {

		return this._gBufferConfig;

	}

	set gBufferConfig(value: GBufferConfig | null) {

		this.dispose();
		this._gBufferConfig = value;

	}

	/**
	 * The current gBuffer struct.
	 */

	get gBuffer(): Record<string, Texture | null> | null {

		return this._gBuffer;

	}

	set gBuffer(value: Record<string, Texture | null>) {

		this._gBuffer = value;

		for(const material of this.materialCache.values()) {

			material.gBuffer = value;

		}

	}

	/**
	 * Indicates whether dithering is enabled.
	 */

	get dithering(): boolean {

		return this._dithering;

	}

	set dithering(value: boolean) {

		if(this._dithering === value) {

			return;

		}

		this._dithering = value;

		for(const material of this.materialCache.values()) {

			if(value && material.outputPrecision !== "lowp") {

				console.info("Dithering only works on 8-bit colors");
				break;

			} else {

				material.dithering = value;
				material.needsUpdate = true;

			}

		}

	}

	/**
	 * Creates materials based on the possible effect combinations.
	 *
	 * @throws {@link Error} If the current effects cannot be merged.
	 */

	private getEffectShaderData(effects: Effect[]): EffectShaderData {

		const result = new EffectShaderData(this.gBufferConfig);
		const effectShaderDataCache = this.effectShaderDataCache;

		for(let i = 0, l = effects.length; i < l; ++i) {

			const effect = effects[i];

			if(!effectShaderDataCache.has(effect)) {

				const data = new EffectShaderData(this.gBufferConfig);
				data.integrateEffect(`e${i}`, effect);
				effectShaderDataCache.set(effect, data);

			}

			if(effect.blendMode.blendFunction.shader !== null) {

				result.add(effectShaderDataCache.get(effect)!);

			}

		}

		return result;

	}

	/**
	 * Creates materials based on the possible effect combinations.
	 *
	 * @throws {@link Error} If the material couldn't be created.
	 */

	private createMaterial(effects: Effect[]): EffectMaterial {

		const result = new EffectMaterial();
		const data = this.getEffectShaderData(effects);

		data.shaderParts.set(Section.FRAGMENT_HEAD_GBUFFER, data.createGBufferStruct());
		data.shaderParts.set(Section.FRAGMENT_HEAD_GDATA, data.createGDataStructDeclaration());
		data.shaderParts.set(Section.FRAGMENT_MAIN_GDATA, data.createGDataStructInitialization());

		const fragmentHead = data.shaderParts.get(Section.FRAGMENT_HEAD_EFFECTS)!;
		data.shaderParts.set(Section.FRAGMENT_HEAD_EFFECTS, fragmentHead + data.createBlendFunctions());

		if(data.colorSpace === SRGBColorSpace) {

			// Convert back to linear.
			const fragmentMainImage = data.shaderParts.get(Section.FRAGMENT_MAIN_IMAGE)!;
			data.shaderParts.set(Section.FRAGMENT_MAIN_IMAGE, fragmentMainImage + "color0 = sRGBToLinear(color0);\n\t");

		}

		// Check if any effect transforms UVs in the fragment shader.
		if(data.uvTransformation) {

			const fragmentMainUv = data.shaderParts.get(Section.FRAGMENT_MAIN_UV)!;
			data.shaderParts.set(Section.FRAGMENT_MAIN_UV, "vec2 transformedUv = vUv;\n" + fragmentMainUv);
			data.defines.set("UV", "transformedUv");

		} else {

			data.defines.set("UV", "vUv");

		}

		// Ensure that leading preprocessor directives start on a new line.
		data.shaderParts.forEach((v, k, map) => map.set(k, v.trim().replace(/^#/, "\n#")));

		// Add input defines and uniforms.
		for(const entry of this.shaderData.defines) {

			data.defines.set(entry[0], entry[1]);

		}

		for(const entry of this.shaderData.uniforms) {

			data.uniforms.set(entry[0], entry[1]);

		}

		return result
			.setShaderParts(data.shaderParts)
			.setDefines(data.defines)
			.setUniforms(data.uniforms);

	}

	/**
	 * Creates materials based on the possible effect combinations.
	 *
	 * If there are no optional effects or if there are too many optional effects, only the required material for the
	 * currently active effects will be created.
	 *
	 * @throws {@link Error} If the materials couldn't be created.
	 */

	private updateMaterials(): void {

		const effects = this.effects;
		const optionalEffects = effects.filter(x => x.optional);
		const tooManyOptionalEffects = optionalEffects.length > EffectMaterialManager.MAX_OPTIONAL_EFFECTS;

		if(optionalEffects.length === 0 || tooManyOptionalEffects) {

			// Only create the required material for the active effects.
			const combination = effects.filter(x => x.enabled);
			const id = EffectMaterialManager.createMaterialId(combination);
			this.materialCache.set(id, this.createMaterial(combination));

		} else {

			// Create materials for all effect combinations.
			for(const combination of this.getEffectCombinations()) {

				const id = EffectMaterialManager.createMaterialId(combination);

				if(!this.materialCache.has(id)) {

					this.materialCache.set(id, this.createMaterial(combination));

				}

			}

		}

	}

	/**
	 * Returns the current shader material.
	 *
	 * The material will be created if it doesn't exist yet. Materials for other possible effect combinations will also be
	 * created and cached for later use.
	 *
	 * @throws {@link Error} If the current effects cannot be merged.
	 */

	getMaterial(): EffectMaterial {

		const effects = this.effects.filter(x => x.enabled);
		const id = EffectMaterialManager.createMaterialId(effects);

		if(!this.materialCache.has(id)) {

			this.updateMaterials();

		}

		return this.materialCache.get(id)!;

	}

	/**
	 * Returns all possible effect combinations based on the {@link Effect.optional} flag.
	 *
	 * @see https://www.geeksforgeeks.org/find-all-the-combinations-of-the-array-values-in-javascript/
	 * @return An iterator that returns the effect combinations.
	 */

	private *getEffectCombinations(): IterableIterator<Effect[]> {

		const effects = this.effects;
		const optionalEffects = effects.filter(x => x.optional);
		const n = optionalEffects.length;
		const m = 1 << n;

		for(let i = 1; i < m; ++i) {

			const combination: Effect[] = [];

			for(let j = 0; j < n; ++j) {

				if(i & (1 << j)) {

					combination.push(optionalEffects[j]);

				}

			}

			yield effects.filter(x => !x.optional || combination.includes(x));

		}

		if(optionalEffects.length === effects.length) {

			yield [];

		}

	}

	/**
	 * Invalidates the material cache.
	 */

	invalidateMaterialCache(): void {

		for(const material of this.materialCache.values()) {

			material.dispose();

		}

		this.materialCache.clear();

	}

	dispose(): void {

		for(const effect of this._effects) {

			effect.removeEventListener(Pass.EVENT_CHANGE, this.changeListener);

		}

		this.invalidateMaterialCache();
		this.effectShaderDataCache.clear();

	}

	/**
	 * Creates a material ID based on a given list of effects.
	 *
	 * The order of the effects matters.
	 *
	 * @param effects - A list of effects.
	 * @return The ID.
	 */

	private static createMaterialId(effects: Effect[]): string {

		return effects.map(x => x.id).join("-");

	}

}
