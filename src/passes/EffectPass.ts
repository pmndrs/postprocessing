import { Event, Material, Texture } from "three";
import { GBufferResource } from "../core/io/GBufferResource.js";
import { Pass } from "../core/Pass.js";
import { Effect } from "../effects/Effect.js";
import { GBuffer } from "../enums/GBuffer.js";
import { EffectMaterial } from "../materials/EffectMaterial.js";
import { EffectMaterialManager } from "../utils/EffectMaterialManager.js";

/**
 * An effect pass.
 *
 * Use this pass to combine {@link Effect} instances.
 *
 * @category Passes
 */

export class EffectPass extends Pass<EffectMaterial> {

	/**
	 * An effect material manager.
	 */

	private readonly effectMaterialManager: EffectMaterialManager;

	/**
	 * An event listener that calls {@link handleEffectEvent}.
	 */

	private readonly effectListener: (e: Event) => void;

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

		this.output.createDefaultBuffer();
		this.effectMaterialManager = new EffectMaterialManager(this.input.shaderData, this.input.requiredTextures);
		this.effectListener = (e: Event) => this.handleEffectEvent(e as Event<string, Effect>);
		this.fullscreenMaterial = this.effectMaterialManager.getMaterial([]);
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
		this.input.requiredTextures.clear();
		this.input.requiredTextures.add(GBuffer.COLOR);

		for(const effect of super.subpasses) {

			this.input.requiredTextures.addAll(...effect.input.requiredTextures);

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

		return this.effectMaterialManager.dithering;

	}

	set dithering(value: boolean) {

		this.effectMaterialManager.dithering = value;

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
			this.effectMaterialManager.invalidateMaterialCache();
			this.materials.clear();

		}

		// Get the material for the current effect combination.
		this.fullscreenMaterial = this.effectMaterialManager.getMaterial(this.effects);

		// Pick up new materials.
		for(const material of this.effectMaterialManager.materials) {

			this.materials.add(material);

		}

	}

	/**
	 * Updates the G-Buffer struct uniform.
	 */

	private updateGBufferStruct(): void {

		const input = this.input;
		const gBufferEntries: [string, Texture | null][] = [];

		for(const texture of input.requiredTextures) {

			// The color texture contains the original output of the initial geometry pass.
			// The default buffer can be a different texture with modified data.
			const useDefaultBuffer = (texture === GBuffer.COLOR as string);
			const resource = useDefaultBuffer ? input.defaultBuffer : input.buffers.get(texture);

			if(resource?.renderTarget instanceof GBufferResource) {

				const gBufferConfig = resource.renderTarget.gBufferSchema;
				gBufferEntries.push([gBufferConfig.gBufferStructFields.get(texture)!, resource.value]);

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
				this.input.requiredTextures.addAll(...e.target.input.requiredTextures);
				this.effectMaterialManager.invalidateShaderData(e.target);
				this.updateMaterial(true);
				break;

			case "toggle":
				this.updateMaterial(false);
				break;

		}

	}

	protected override onInputChange(): void {

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
