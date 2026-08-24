import { Event, Material, Texture } from "three";
import { Pass } from "../core/Pass.js";
import { Effect } from "../effects/Effect.js";
import { GBuffer } from "../enums/GBuffer.js";
import { EffectMaterial } from "../materials/EffectMaterial.js";
import { EffectMaterialCache } from "../utils/EffectMaterialCache.js";
import { GData } from "../enums/GData.js";

/**
 * An effect pass.
 *
 * Use this pass to combine {@link Effect} instances.
 *
 * @category Passes
 */

export class EffectPass extends Pass<EffectMaterial> {

	/**
	 * An event listener that calls {@link handleEffectEvent}.
	 */

	private readonly effectListener: (e: Event) => void;

	/**
	 * An effect material cache.
	 */

	private readonly effectMaterialCache: EffectMaterialCache;

	/**
	 * An animation time scale.
	 */

	timeScale: number;

	/**
	 * Constructs a new effect pass.
	 *
	 * @param effects - The effects that will be rendered by this pass.
	 */

	constructor(...effects: Effect[]) {

		super("EffectPass");

		this.createDefaultBuffer();
		this.effectListener = (e: Event) => this.handleEffectEvent(e as Event<string, Effect>);
		this.effectMaterialCache = new EffectMaterialCache(this.input);
		this.fullscreenMaterial = this.effectMaterialCache.getMaterial([]);
		this.effects = effects;
		this.timeScale = 1.0;

	}

	override get subpasses(): readonly Pass<Material | null>[] {

		return super.subpasses;

	}

	private override set subpasses(value: Pass<Material | null>[]) {

		for(const effect of super.subpasses) {

			effect.removeEventListener("change", this.effectListener);
			effect.removeEventListener("toggle", this.effectListener);

		}

		super.subpasses = value;
		this.updateRequiredTextures();

		for(const effect of super.subpasses) {

			effect.addEventListener("change", this.effectListener);
			effect.addEventListener("toggle", this.effectListener);

		}

		this.updateMaterial(true);

	}

	/**
	 * The effects.
	 *
	 * @throws If there are duplicate effects or if the effects cannot be merged.
	 */

	get effects(): readonly Effect[] {

		return this.subpasses as readonly Effect[];

	}

	set effects(value: Effect[]) {

		const distinctEffects = new Set(value);

		if(distinctEffects.size < value.length) {

			const duplicates = value.filter(x => !distinctEffects.has(x)).map(x => x.name);
			throw new Error(`Encountered duplicate effects: ${duplicates.join(", ")}`);

		}

		this.subpasses = value;

	}

	/**
	 * Controls whether dithering is enabled.
	 */

	get dithering(): boolean {

		return this.effectMaterialCache.dithering;

	}

	set dithering(value: boolean) {

		this.effectMaterialCache.dithering = value;

	}

	/**
	 * Determines required input textures based on the current effects.
	 */

	private updateRequiredTextures(): void {

		const schema = this.input.gBufferSchema;
		const requiredTextures = new Set<string>([GBuffer.COLOR]);
		const requiredGData = new Set<string>([GData.COLOR]);

		for(const effect of this.effects) {

			for(const texture of effect.input.requiredTextures) {

				requiredTextures.add(texture);

			}

			for(const gData of effect.gData) {

				requiredGData.add(gData);

			}

		}

		if(schema !== null) {

			for(const component of schema.resolveGBufferComponents(requiredGData)) {

				requiredTextures.add(component);

			}

		}

		this.input.setRequiredTextures(requiredTextures);

	}

	/**
	 * Updates the fullscreen material based on the current effect combination.
	 *
	 * The required material will be swapped in if it exists. Otherwise, a new material will be created.
	 *
	 * @param invalidateCache - Controls whether the material cache should be rebuilt.
	 * @throws If the current effects cannot be merged.
	 */

	protected updateMaterial(invalidateCache: boolean): void {

		if(invalidateCache) {

			// Remove all materials.
			this.effectMaterialCache.invalidateMaterialCache();
			this.materials.clear();

		}

		// Get the material for the current effect combination.
		this.fullscreenMaterial = this.effectMaterialCache.getMaterial(this.effects);

		// Pick up new materials.
		for(const material of this.effectMaterialCache.materials) {

			this.materials.add(material);

		}

	}

	/**
	 * Updates the G-Buffer struct uniform.
	 */

	private updateGBufferStruct(): void {

		const input = this.input;
		const gBufferEntries: [string, Texture | null][] = [];
		const schema = this.input.gBufferSchema;

		if(schema === null) {

			return;

		}

		for(const texture of input.requiredTextures) {

			// The color texture contains the original output of the initial geometry pass.
			// The default buffer can be a different texture with modified data.
			const useDefaultBuffer = (texture === GBuffer.COLOR as string);
			const resource = useDefaultBuffer ? input.defaultBuffer : input.buffers.get(texture);
			const structField = schema.gBufferStructFields.get(texture);

			if(resource !== undefined && structField !== undefined) {

				gBufferEntries.push([structField, resource.value]);

			}

		}

		this.fullscreenMaterial.gBuffer = Object.fromEntries(gBufferEntries);

	}

	/**
	 * Handles {@link Effect} events.
	 *
	 * @param event - An event.
	 */

	private handleEffectEvent(e: Event<string, Effect>): void {

		switch(e.type) {

			case "change":
				this.updateRequiredTextures();
				this.effectMaterialCache.invalidateShaderData(e.target);
				this.updateMaterial(true);
				break;

			case "toggle":
				this.updateMaterial(false);
				break;

		}

	}

	protected override onInputChange(): void {

		this.updateRequiredTextures();
		this.updateGBufferStruct();
		this.updateMaterial(true);

	}

	override async compile(): Promise<void> {

		// Make sure all materials are created prior to compilation.
		this.updateMaterial(false);
		return super.compile();

	}

	override render(): void {

		if(this.renderer === null || this.timer === null) {

			return;

		}

		this.renderSubpasses();
		this.fullscreenMaterial.time += this.timer.getDelta() * this.timeScale;
		this.setRenderTarget(this.output.defaultBuffer?.value);
		this.renderFullscreen();

	}

}
