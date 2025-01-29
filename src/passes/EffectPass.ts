import { WebGLRenderer, Material, Texture } from "three";
import { Pass } from "../core/Pass.js";
import { Effect } from "../effects/Effect.js";
import { GBuffer } from "../enums/GBuffer.js";
import { EffectMaterial } from "../materials/EffectMaterial.js";
import { GBufferConfig } from "../utils/GBufferConfig.js";
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
	 * An event listener that calls {@link updateMaterial} and invalidates the material cache.
	 */

	private readonly effectChangeListener: () => void;

	/**
	 * An event listener that calls {@link updateMaterial} without invalidating the material cache.
	 */

	private readonly effectToggleListener: () => void;

	/**
	 * Keeps track of the previous G-Buffer configuration.
	 */

	private previousGBufferConfig: GBufferConfig | null;

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
		this.effectChangeListener = () => this.updateMaterial(true);
		this.effectToggleListener = () => this.updateMaterial(false);
		this.previousGBufferConfig = null;
		this.effects = effects;
		this.timeScale = 1.0;

	}

	override get subpasses(): readonly Pass<Material | null>[] {

		return super.subpasses;

	}

	private override set subpasses(value: Pass<Material | null>[]) {

		for(const effect of super.subpasses) {

			effect.removeEventListener(Pass.EVENT_CHANGE, this.effectChangeListener);
			effect.removeEventListener(Pass.EVENT_TOGGLE, this.effectToggleListener);

		}

		super.subpasses = value;
		this.input.gBuffer.clear();

		for(const effect of super.subpasses) {

			for(const gBufferComponent of effect.input.gBuffer) {

				this.input.gBuffer.add(gBufferComponent);

			}

			effect.addEventListener(Pass.EVENT_CHANGE, this.effectChangeListener);
			effect.addEventListener(Pass.EVENT_TOGGLE, this.effectToggleListener);

		}

		this.updateMaterial(true);

	}

	/**
	 * The effects.
	 */

	get effects(): readonly Effect[] {

		return this.subpasses as readonly Effect[];

	}

	protected set effects(value: Effect[]) {

		this.effectMaterialManager.effects = value;
		this.subpasses = value;

	}

	/**
	 * Indicates whether dithering is enabled.
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
	 * @param invalidateCache - Controls whether the material cache should be rebuild. Defaults to `false`.
	 */

	protected updateMaterial(invalidateCache = false): void {

		try {

			if(invalidateCache) {

				// Remove all materials.
				this.effectMaterialManager.invalidateMaterialCache();
				this.materials.clear();

			}

			// Get the material for the current effect combination.
			this.fullscreenMaterial = this.effectMaterialManager.getMaterial();

			// Pick up new materials.
			for(const material of this.effectMaterialManager.materials) {

				this.materials.add(material);

			}

		} catch(e) {

			console.error(e);
			console.info("Disabling pass:", this);
			this.enabled = false;

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

		this.effectMaterialManager.gBuffer = Object.fromEntries(gBufferEntries);

	}

	protected override onInputChange(): void {

		this.updateGBufferStruct();

		// Make the input buffers available to all effects.

		for(const effect of this.effects) {

			effect.input.buffers.clear();

			for(const entry of this.input.buffers) {

				effect.input.buffers.set(entry[0], entry[1]);

			}

		}

		// Clean up and listen for G-Buffer config changes to rebuild the material when needed.

		if(this.previousGBufferConfig !== this.input.gBufferConfig) {

			if(this.previousGBufferConfig !== null) {

				this.previousGBufferConfig.removeEventListener(GBufferConfig.EVENT_CHANGE, this.effectChangeListener);

			}

			if(this.input.gBufferConfig !== null) {

				this.input.gBufferConfig.addEventListener(GBufferConfig.EVENT_CHANGE, this.effectChangeListener);

			}

			this.previousGBufferConfig = this.input.gBufferConfig;
			this.effectMaterialManager.gBufferConfig = this.input.gBufferConfig;

		}

	}

	protected override onResolutionChange(): void {

		const resolution = this.resolution;
		this.fullscreenMaterial.setSize(resolution.width, resolution.height);

		for(const effect of this.effects) {

			effect.resolution.setBaseSize(resolution.baseWidth, resolution.baseHeight);

		}

	}

	override checkRequirements(renderer: WebGLRenderer): void {

		for(const effect of this.effects) {

			effect.checkRequirements(renderer);

		}

	}

	override dispose(): void {

		for(const effect of this.effects) {

			effect.removeEventListener(Pass.EVENT_CHANGE, this.effectChangeListener);
			effect.removeEventListener(Pass.EVENT_TOGGLE, this.effectToggleListener);

		}

		this.effectMaterialManager.dispose();
		super.dispose();

	}

	override render(): void {

		if(this.renderer === null || this.timer === null) {

			return;

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
