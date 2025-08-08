import { Event as Event3, Material, Texture } from "three";
import { Pass } from "../core/Pass.js";
import { Effect } from "../effects/Effect.js";
import { GBuffer } from "../enums/GBuffer.js";
import { EffectMaterial } from "../materials/EffectMaterial.js";
import { GBufferConfig } from "../utils/gbuffer/GBufferConfig.js";
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

	private readonly effectListener: (e: Event3) => void;

	/**
	 * An event listener that calls {@link handleGBufferConfigEvent}.
	 */

	private readonly gBufferConfigListener: (e: Event3) => void;

	/**
	 * Keeps track of the previous G-Buffer configuration.
	 */

	private previousGBufferConfig: GBufferConfig | null;

	/**
	 * Indicates whether this pass has been disposed.
	 *
	 * If true, resources will be refreshed before the next render operation.
	 */

	private disposed: boolean;

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

		this.output.defaultBuffer = this.createFramebuffer();
		this.effectMaterialManager = new EffectMaterialManager(this.input);
		this.effectMaterialManager.gBuffer = this.input.gBuffer;
		this.effectListener = (e: Event3) => this.handleEffectEvent(e);
		this.gBufferConfigListener = (e: Event3) => this.handleGBufferConfigEvent(e);
		this.previousGBufferConfig = null;
		this.effects = effects;
		this.disposed = false;
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
		this.input.gBuffer.clear();

		for(const effect of super.subpasses) {

			this.copyGBufferComponents(effect as Effect);

			effect.addEventListener("change", this.effectListener);
			effect.addEventListener("toggle", this.effectListener);

		}

		this.updateMaterial(true);
		this.disposed = false;

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
	 * Copies the G-Buffer components of the given effect.
	 *
	 * @param effect - The effect.
	 */

	private copyGBufferComponents(effect: Effect): void {

		for(const gBufferComponent of effect.input.gBuffer) {

			this.input.gBuffer.add(gBufferComponent);

		}

	}

	/**
	 * Updates the fullscreen material based on the current effect combination.
	 *
	 * The required material will be swapped in if it exists. Otherwise, a new material will be created.
	 *
	 * @param invalidateCache - Controls whether the material cache should be rebuild.
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
		const gBufferConfig = input.gBufferConfig;

		if(gBufferConfig === null) {

			return;

		}

		const gBufferEntries: [string, Texture | null][] = [];

		for(const component of input.gBuffer) {

			const useDefaultBuffer = (component === GBuffer.COLOR as string);
			const buffer = useDefaultBuffer ? input.defaultBuffer?.value : input.buffers.get(component)?.value;
			gBufferEntries.push([gBufferConfig.gBufferStructFields.get(component)!, buffer ?? null]);

		}

		this.fullscreenMaterial.gBuffer = Object.fromEntries(gBufferEntries);

	}

	// #region Event Handlers

	/**
	 * Handles {@link Effect} events.
	 *
	 * @param event - An event.
	 */

	private handleEffectEvent(e: Event3): void {

		switch(e.type) {

			case "change":
				this.copyGBufferComponents(e.target as Effect);
				this.effectMaterialManager.invalidateShaderData(e.target as Effect);
				this.updateMaterial(true);
				break;

			case "toggle":
				this.updateMaterial(false);
				break;

		}

	}

	/**
	 * Handles {@link GBufferConfig} events.
	 *
	 * @param event - An event.
	 */

	private handleGBufferConfigEvent(e: Event3): void {

		switch(e.type) {

			case "change":
				this.updateMaterial(true);
				break;

		}

	}

	// #endregion

	/**
	 * Performs tasks when the {@link GBufferConfig} has changed.
	 */

	private onGBufferConfigChange(): void {

		const gBufferConfig = this.input.gBufferConfig;

		if(this.previousGBufferConfig !== null) {

			this.previousGBufferConfig.removeEventListener("change", this.gBufferConfigListener);

		}

		if(this.input.gBufferConfig !== null) {

			this.input.gBufferConfig.addEventListener("change", this.gBufferConfigListener);

		}

		this.effectMaterialManager.gBufferConfig = gBufferConfig;
		this.previousGBufferConfig = gBufferConfig;

		for(const effect of this.effects) {

			effect.input.gBufferConfig = gBufferConfig;

		}

		// Discard outdated materials and rebuild.
		this.updateMaterial(true);

	}

	protected override onInputChange(): void {

		this.updateGBufferStruct();

		for(const effect of this.effects) {

			// Temporarily remove the listener to avoid unnecessary event churn.
			effect.removeEventListener("change", this.effectListener);
			effect.input.buffers.clear();

			for(const entry of this.input.buffers) {

				effect.input.buffers.set(entry[0], entry[1]);

			}

			effect.addEventListener("change", this.effectListener);

		}

		if(this.previousGBufferConfig !== this.input.gBufferConfig) {

			this.onGBufferConfigChange();

		} else {

			// Discard outdated materials and rebuild.
			this.updateMaterial(true);

		}

	}

	protected override onResolutionChange(): void {

		const resolution = this.resolution;
		this.fullscreenMaterial.setSize(resolution.width, resolution.height);

		for(const effect of this.effects) {

			effect.resolution.setBaseSize(resolution.baseWidth, resolution.baseHeight);

		}

	}

	override checkRequirements(): void {

		for(const effect of this.effects) {

			effect.checkRequirements();

		}

	}

	override async compile(): Promise<void> {

		// Make sure all materials are created prior to compilation.
		this.updateMaterial(false);
		return super.compile();

	}

	override dispose(): void {

		for(const effect of this.effects) {

			effect.removeEventListener("change", this.effectListener);
			effect.removeEventListener("toggle", this.effectListener);

		}

		if(this.input.gBufferConfig !== null) {

			this.input.gBufferConfig.removeEventListener("change", this.gBufferConfigListener);

		}

		this.effectMaterialManager.dispose();
		super.dispose();

		this.disposed = true;

	}

	override render(): void {

		if(this.renderer === null || this.timer === null) {

			return;

		}

		if(this.disposed) {

			// Restore resources and event listeners.
			this.effects = [...this.effects];

		}

		for(const effect of this.effects) {

			if(effect.enabled) {

				effect.render();

			}

		}

		this.fullscreenMaterial.time += this.timer.getDelta() * this.timeScale;
		this.setRenderTarget(this.output.defaultBuffer?.value);
		this.renderFullscreen();

	}

}
