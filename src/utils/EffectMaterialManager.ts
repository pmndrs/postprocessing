import { SRGBColorSpace } from "three";
import { Disposable } from "../core/Disposable.js";
import { ShaderData } from "../core/ShaderData.js";
import { Effect } from "../effects/Effect.js";
import { EffectShaderSection as Section } from "../enums/EffectShaderSection.js";
import { GBuffer } from "../enums/GBuffer.js";
import { EffectMaterial } from "../materials/EffectMaterial.js";
import { GBufferConfig } from "./gbuffer/GBufferConfig.js";
import { EffectShaderData } from "./EffectShaderData.js";

/**
 * An effect material manager that creates, updates and caches effect shader combinations.
 *
 * @category Utils
 * @ignore
 */

export class EffectMaterialManager implements Disposable {

	/**
	 * The maximum number of optional effects.
	 *
	 * If there are too many optional effects, materials will not be created ahead of time.
	 */

	static readonly MAX_OPTIONAL_EFFECTS = 6;

	/**
	 * The ID of the default material.
	 */

	private static readonly DEFAULT_MATERIAL_ID = "default";

	/**
	 * A collection of shader data that will be applied to new materials.
	 */

	private readonly shaderData: ShaderData;

	/**
	 * A default effect material.
	 *
	 * The base `uniforms` and `defines` of this material are shared between all materials.
	 */

	private readonly defaultMaterial: EffectMaterial;

	/**
	 * A collection that maps combined effect IDs to effect materials.
	 */

	private readonly materialCache: Map<string, EffectMaterial>;

	/**
	 * A collection that maps effects to extracted shader data for integration into materials.
	 */

	private readonly effectShaderDataCache: Map<Effect, EffectShaderData>;

	/**
	 * A material that is currently active.
	 */

	private activeMaterial: EffectMaterial | null;

	// #region Backing Data

	/**
	 * @see {@link gBufferConfig}
	 */

	private _gBufferConfig: GBufferConfig | null;

	/**
	 * @see {@link gBufferConfig}
	 */

	private _gBuffer: Set<GBuffer | string> | null;

	/**
	 * @see {@link dithering}
	 */

	private _dithering: boolean;

	// #endregion

	/**
	 * Constructs a new effect material manager.
	 *
	 * @param shaderData - A collection of shader data that will be applied to new materials.
	 */

	constructor(shaderData: ShaderData) {

		this.shaderData = shaderData;
		this.defaultMaterial = new EffectMaterial();
		this.materialCache = new Map<string, EffectMaterial>();
		this.effectShaderDataCache = new Map<Effect, EffectShaderData>();
		this.activeMaterial = null;

		this._gBufferConfig = null;
		this._gBuffer = null;
		this._dithering = false;

	}

	/**
	 * The current materials.
	 */

	get materials(): Iterable<EffectMaterial> {

		return this.materialCache.values();

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

		if(this._gBufferConfig !== value) {

			this.dispose();
			this._gBufferConfig = value;

		}

	}

	/**
	 * The current input G-Buffer components.
	 *
	 * Assigning a new G-Buffer will invalidate the material cache.
	 */

	get gBuffer(): Set<GBuffer | string> | null {

		return this._gBuffer;

	}

	set gBuffer(value: Set<GBuffer | string> | null) {

		if(this._gBuffer !== value) {

			this.invalidateMaterialCache();
			this._gBuffer = value;

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
	 * Creates effect shader data based on the given effects.
	 *
	 * @param effects - The effects.
	 * @return The shader data.
	 * @throws If the current effects cannot be merged.
	 */

	private getEffectShaderData(effects: Effect[]): EffectShaderData {

		const result = new EffectShaderData();
		const effectShaderDataCache = this.effectShaderDataCache;

		for(const effect of effects) {

			if(!effectShaderDataCache.has(effect)) {

				const data = new EffectShaderData();
				data.integrateEffect(`e${effect.id}`, effect);
				effectShaderDataCache.set(effect, data);

			}

			if(effect.blendMode.blendFunction.shader !== null) {

				result.add(effectShaderDataCache.get(effect)!);

			}

		}

		return result;

	}

	/**
	 * Creates shader code for a `GBuffer` struct declaration.
	 *
	 * @param gBufferConfig - A G-Buffer config.
	 * @return The shader code.
	 */

	private createGBufferStructDeclaration(gBufferConfig: GBufferConfig): string {

		if(this.gBuffer === null) {

			throw new Error("Missing G-Buffer information");

		}

		return [
			"struct GBuffer {",
			...Array.from(gBufferConfig.gBufferStructDeclaration)
				.filter(x => this.gBuffer!.has(x[0]))
				.map(x => `\t${x[1]}`),
			"};\n"
		].join("\n");

	}

	/**
	 * Creates a material based on the given effects.
	 *
	 * @param effects - The effects that make up the material.
	 * @return The material.
	 * @throws If the material couldn't be created.
	 */

	private createMaterial(effects: Effect[]): EffectMaterial {

		const id = EffectMaterialManager.getMaterialId(effects);
		const result = (id === EffectMaterialManager.DEFAULT_MATERIAL_ID) ? this.defaultMaterial : new EffectMaterial();
		const data = this.getEffectShaderData(effects);

		const gBufferConfig = this.gBufferConfig;

		if(gBufferConfig !== null) {

			data.shaderParts.set(Section.FRAGMENT_HEAD_GBUFFER, this.createGBufferStructDeclaration(gBufferConfig));
			data.shaderParts.set(Section.FRAGMENT_HEAD_GDATA, data.createGDataStructDeclaration(gBufferConfig));
			data.shaderParts.set(Section.FRAGMENT_MAIN_GDATA, data.createGDataStructInitialization(gBufferConfig));

		}

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

		// Ensure that leading preprocessor directives start on a new line after getting merged.
		data.shaderParts.forEach((v, k, map) => map.set(k, v.trim().replace(/^#/, "\n#")));

		// Add input defines and uniforms.
		for(const entry of this.shaderData.defines) {

			data.defines.set(entry[0], entry[1]);

		}

		for(const entry of this.shaderData.uniforms) {

			data.uniforms.set(entry[0], entry[1]);

		}

		if(result !== this.defaultMaterial) {

			// Share base uniforms and defines between all materials.
			for(const entry of Object.entries(this.defaultMaterial.uniforms)) {

				result.uniforms[entry[0]] = entry[1];

			}

			for(const entry of Object.entries(this.defaultMaterial.defines)) {

				result.defines[entry[0]] = entry[1] as string | number | boolean;

			}

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
	 * @param effects - The effects.
	 * @throws If the materials couldn't be created.
	 */

	private createMaterials(effects: readonly Effect[]): void {

		const optionalEffects = effects.filter(x => x.optional);
		const tooManyOptionalEffects = optionalEffects.length > EffectMaterialManager.MAX_OPTIONAL_EFFECTS;

		if(optionalEffects.length === 0 || tooManyOptionalEffects) {

			// Only create the required material for the active effects.
			const combination = effects.filter(x => x.enabled);
			const id = EffectMaterialManager.getMaterialId(combination);
			this.materialCache.set(id, this.createMaterial(combination));

			return;

		}

		// Create materials for all effect combinations.
		for(const combination of this.getEffectCombinations(effects)) {

			const id = EffectMaterialManager.getMaterialId(combination);

			if(!this.materialCache.has(id)) {

				this.materialCache.set(id, this.createMaterial(combination));

			}

		}

	}

	/**
	 * Synchronizes the cached materials with the active material.
	 *
	 * This ensures that any changes to the backing data of the active material will be applied to all materials.
	 */

	private synchronizeMaterials(): void {

		if(this.activeMaterial === null) {

			return;

		}

		const activeMaterial = this.activeMaterial;
		const defaultMaterial = this.defaultMaterial;

		// Compare and synchronize the base macros.
		for(const entry of Object.entries(defaultMaterial.defines)) {

			if(entry[1] !== activeMaterial.defines[entry[0]]) {

				defaultMaterial.defines[entry[0]] = activeMaterial.defines[entry[0]] as string | number | boolean;
				defaultMaterial.needsUpdate = true;

			}

		}

		if(!defaultMaterial.needsUpdate) {

			return;

		}

		// Update the other materials.
		for(const material of this.materialCache.values()) {

			if(material === defaultMaterial) {

				// Skip self.
				continue;

			}

			for(const entry of Object.entries(defaultMaterial.defines)) {

				material.defines[entry[0]] = entry[1] as string | number | boolean;

			}

			material.needsUpdate = true;

		}

	}

	/**
	 * Returns a shader material for the current effect configuration.
	 *
	 * The required material will be created if it doesn't exist yet. Materials for other possible effect combinations
	 * will also be created and cached for later use.
	 *
	 * @throws If the current effects cannot be merged.
	 */

	getMaterial(effects: readonly Effect[]): EffectMaterial {

		if(this.gBufferConfig === null) {

			// Effects don't need to be processed if there is no G-Buffer configuration.
			return this.defaultMaterial;

		}

		this.synchronizeMaterials();

		const activeEffects = effects.filter(x => x.enabled);
		const id = EffectMaterialManager.getMaterialId(activeEffects);

		if(!this.materialCache.has(id)) {

			this.createMaterials(effects);

		}

		this.activeMaterial = this.materialCache.get(id)!;
		return this.activeMaterial;

	}

	/**
	 * Returns all possible effect combinations based on the {@link Effect.optional} flag.
	 *
	 * @see https://www.geeksforgeeks.org/find-all-the-combinations-of-the-array-values-in-javascript
	 * @param effects - The effects.
	 * @return An iterator that returns the effect combinations.
	 */

	private *getEffectCombinations(effects: readonly Effect[]): IterableIterator<Effect[]> {

		const optionalEffects = effects.filter(x => x.optional);
		const n = optionalEffects.length;
		const m = 1 << n;

		for(let i = 0; i < m; ++i) {

			const combination: Effect[] = [];

			for(let j = 0; j < n; ++j) {

				if(i & (1 << j)) {

					combination.push(optionalEffects[j]);

				}

			}

			// Keep effects that are always enabled or part of the current combination.
			yield effects.filter(x => !x.optional || combination.includes(x));

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

	/**
	 * Invalidates the shader data associated with the given effect.
	 *
	 * @param effect - The effect for which the shader data should be deleted.
	 */

	invalidateShaderData(effect: Effect): void {

		this.effectShaderDataCache.delete(effect);

	}

	dispose(): void {

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

	private static getMaterialId(effects: Effect[]): string {

		return (effects.length === 0) ?
			EffectMaterialManager.DEFAULT_MATERIAL_ID :
			effects.map(x => x.id).join("-");

	}

}
