import {
	DepthFormat,
	DepthStencilFormat,
	DepthTexture,
	FloatType,
	HalfFloatType,
	LinearFilter,
	Material,
	NearestFilter,
	NoColorSpace,
	Object3D,
	OrthographicCamera,
	PerspectiveCamera,
	RGBAFormat,
	RGBFormat,
	RGFormat,
	SRGBColorSpace,
	Scene,
	TextureDataType,
	UnsignedByteType,
	UnsignedInt248Type,
	WebGLRenderTarget,
	WebGLRenderer
} from "three";

import { RenderTargetResource } from "../core/io/RenderTargetResource.js";
import { Pass } from "../core/Pass.js";
import { Selective } from "../core/Selective.js";
import { SetExtensions } from "../core/SetExtensions.js";
import { GBuffer } from "../enums/GBuffer.js";
import { MSAASamples } from "../enums/MSAASamples.js";
import { GBufferConfig } from "../utils/gbuffer/GBufferConfig.js";
import { GBufferShaderPlugin } from "../utils/gbuffer/GBufferShaderPlugin.js";
import { GBufferTextureConfig } from "../utils/gbuffer/GBufferTextureConfig.js";
import { extractIndices } from "../utils/gbuffer/GBufferUtils.js";
import { ObservableSet } from "../utils/ObservableSet.js";
import { Selection } from "../utils/Selection.js";
import { ClearPass } from "./ClearPass.js";
import { CopyPass } from "./CopyPass.js";

/**
 * GeometryPass constructor options.
 *
 * @category Passes
 */

export interface GeometryPassOptions {

	/**
	 * Controls whether color buffers should use an alpha channel.
	 *
	 * Disabling alpha enables small internal float formats for reduced memory consumption.
	 *
	 * @see https://www.khronos.org/opengl/wiki/Small_Float_Formats
	 * @defaultValue false
	 */

	alpha?: boolean;

	/**
	 * Determines whether a stencil buffer should be created.
	 *
	 * @defaultValue false
	 */

	stencilBuffer?: boolean;

	/**
	 * Determines whether a depth buffer should be created.
	 *
	 * @defaultValue true
	 */

	depthBuffer?: boolean;

	/**
	 * The texture data type used for color buffers.
	 *
	 * Disabling {@link alpha} enables small internal float formats for reduced memory consumption.
	 *
	 * @see https://www.khronos.org/opengl/wiki/Small_Float_Formats
	 * @defaultValue HalfFloatType
	 */

	frameBufferType?: TextureDataType;

	/**
	 * The amount of samples used for MSAA.
	 *
	 * @defaultValue 0
	 */

	samples?: MSAASamples;

	/**
	 * A G-Buffer configuration.
	 */

	gBufferConfig?: GBufferConfig;

	/**
	 * Determines whether automatic clearing is enabled.
	 *
	 * @defaultValue true
	 */

	autoClear?: boolean;

}

/**
 * A geometry pass.
 *
 * @category Passes
 */

export class GeometryPass extends Pass implements GeometryPassOptions, Selective {

	/**
	 * Identifies the G-Buffer resource.
	 */

	private static readonly GBUFFER = "GBUFFER";

	readonly selection: Selection;

	/**
	 * A clear pass that clears the G-Buffer by default.
	 *
	 * Clearing will be disabled if the G-Buffer is not the default output buffer or if the {@link copyPass} is enabled.
	 *
	 * @see {@link autoClear} to disable the auto clear behavior.
	 */

	protected readonly clearPass: ClearPass;

	/**
	 * A pass that copies the default input buffer to the default output buffer.
	 *
	 * This pass will be disabled if the buffers are the same or the output buffer has multiple texture attachments.
	 */

	private readonly copyPass: CopyPass;

	/**
	 * A shader plugin that enables rendering to G-Buffer render targets.
	 */

	private readonly gBufferShaderPlugin: GBufferShaderPlugin;

	/**
	 * A resource that wraps the G-Buffer.
	 */

	private readonly gBufferResource: RenderTargetResource;

	/**
	 * Controls which G-Buffer components should be rendered by this pass.
	 *
	 * This will automatically be configured based on the requirements of other passes in the same pipeline.
	 *
	 * @see {@link GBuffer} for built-in components.
	 * @internal
	 */

	readonly gBufferComponents: Set<string> & SetExtensions<string>;

	// #region Settings

	readonly alpha: boolean;
	readonly stencilBuffer: boolean;
	readonly depthBuffer: boolean;
	readonly frameBufferType: TextureDataType;
	readonly gBufferConfig: GBufferConfig;

	/**
	 * @see {@link samples}
	 */

	private _samples: MSAASamples;

	/**
	 * @see {@link autoClear}
	 */

	private _autoClear: boolean;

	// #endregion

	/**
	 * Constructs a new geometry pass.
	 *
	 * @param scene - A scene.
	 * @param camera - A camera.
	 * @param options - Additional options.
	 */

	constructor(scene: Scene | null, camera: OrthographicCamera | PerspectiveCamera | null, {
		alpha = false,
		stencilBuffer = false,
		depthBuffer = true,
		frameBufferType = HalfFloatType,
		samples = 0,
		gBufferConfig = new GBufferConfig(),
		autoClear = true
	}: GeometryPassOptions = {}) {

		super("GeometryPass");

		this.alpha = alpha;
		this.stencilBuffer = stencilBuffer;
		this.depthBuffer = depthBuffer;
		this.frameBufferType = frameBufferType;
		this._samples = samples;
		this._autoClear = autoClear;

		this.selection = new Selection();
		this.selection.enabled = false;
		this.gBufferConfig = gBufferConfig;

		this.clearPass = new ClearPass();
		this.clearPass.enabled = autoClear;
		this.copyPass = new CopyPass();
		this.copyPass.enabled = false;
		this.subpasses = [this.clearPass, this.copyPass];

		const gBufferComponents = new ObservableSet<string>();
		gBufferComponents.addEventListener("change", () => this.updateGBuffer());
		this.gBufferComponents = gBufferComponents;
		this.gBufferShaderPlugin = new GBufferShaderPlugin();
		this.gBufferResource = new RenderTargetResource();
		this.output.buffers.set(GeometryPass.GBUFFER, this.gBufferResource);
		this.output.defaultBuffer = this.gBufferResource;

		this.scene = scene;
		this.camera = camera;

		this.updateTextureConfigs();
		this.updateGBuffer();

	}

	// #region Accessors

	override get enabled(): boolean {

		return super.enabled;

	}

	override set enabled(value: boolean) {

		if(super.enabled === value) {

			return;

		}

		super.enabled = value;
		this.gBufferShaderPlugin.enabled = value;
		this.invalidateMaterials();

	}

	override get scene(): Scene | null {

		return super.scene;

	}

	override set scene(value: Scene | null) {

		super.scene = value;

		if(value !== null) {

			this.onSceneChildAdded(value);

		}

	}

	get samples(): MSAASamples {

		return this._samples;

	}

	set samples(value: MSAASamples) {

		this._samples = value;

		const buffer = this.gBufferResource?.value ?? null;

		if(buffer !== null && buffer.samples !== value) {

			buffer.samples = value;
			buffer.dispose();

		}

	}

	get autoClear(): boolean {

		return this._autoClear;

	}

	set autoClear(value: boolean) {

		this._autoClear = value;
		this.clearPass.enabled &&= value;

	}

	/**
	 * Returns the G-Buffer render target, or null if this pass renders to screen.
	 */

	get gBuffer(): WebGLRenderTarget | null {

		return this.gBufferResource.value;

	}

	/**
	 * Indicates whether the primary frame buffer is capable of storing HDR values.
	 */

	private get frameBufferPrecisionHigh(): boolean {

		return this.frameBufferType === HalfFloatType || this.frameBufferType === FloatType;

	}

	/**
	 * Returns the G-Buffer texture configs that correspond to the current G-Buffer components.
	 */

	protected get textureConfigs(): [string, GBufferTextureConfig][] {

		return Array.from(this.gBufferConfig.textureConfigs).filter(x => this.gBufferComponents.has(x[0]));

	}

	override get renderer(): WebGLRenderer | null {

		return super.renderer;

	}

	override set renderer(value: WebGLRenderer | null) {

		super.renderer = value;
		this.updateGBufferColorSpace();

	}

	// #endregion

	/**
	 * Refreshes the material of the given object.
	 *
	 * @param object - The object to update.
	 */

	private invalidateMaterial(object: Object3D): void {

		if(!("material" in object)) {

			return;

		}

		const materials = (Array.isArray(object.material) ? object.material : [object.material]) as Material[];

		for(const material of materials) {

			material.needsUpdate = true;

		}

	}

	/**
	 * Refreshes the materials of the scene objects.
	 */

	private invalidateMaterials(): void {

		this.scene?.traverse((node) => this.invalidateMaterial(node));

	}

	/**
	 * Defines all possible G-Buffer texture configs.
	 */

	protected updateTextureConfigs(): void {

		const textureConfigs = this.gBufferConfig.textureConfigs;
		const useSmallFloatFormat = (this.frameBufferPrecisionHigh && !this.alpha);

		textureConfigs.set(GBuffer.COLOR, {
			minFilter: LinearFilter,
			magFilter: LinearFilter,
			type: useSmallFloatFormat ? FloatType : this.frameBufferType,
			format: useSmallFloatFormat ? RGBFormat : RGBAFormat,
			internalFormat: useSmallFloatFormat ? "R11F_G11F_B10F" : undefined,
			isColorBuffer: true
		});

		textureConfigs.set(GBuffer.NORMAL, {
			minFilter: NearestFilter,
			magFilter: NearestFilter,
			type: HalfFloatType,
			format: RGFormat
		});

		textureConfigs.set(GBuffer.ORM, {
			minFilter: NearestFilter,
			magFilter: NearestFilter,
			type: UnsignedByteType,
			format: RGBAFormat
		});

		textureConfigs.set(GBuffer.EMISSION, {
			minFilter: LinearFilter,
			magFilter: LinearFilter,
			type: HalfFloatType,
			format: RGBAFormat
			// R11F_G11F_B10F causes artifacts in some scenes.
		});

	}

	/**
	 * Enables rendering to {@link GBuffer} components for the materials of a given object.
	 *
	 * Should also be called when a material is added, removed or replaced at runtime.
	 *
	 * @param object - The object to update.
	 */

	private updateMaterial(object: Object3D): void {

		if(!("material" in object)) {

			return;

		}

		const materials = (Array.isArray(object.material) ? object.material : [object.material]) as Material[];

		for(const material of materials) {

			this.gBufferShaderPlugin.applyTo(material);

		}

	}

	/**
	 * Updates the color space of the G-Buffer texture attachments.
	 */

	private updateGBufferColorSpace(): void {

		const gBuffer = this.gBuffer;
		const renderer = this.renderer;

		if(gBuffer === null || renderer === null) {

			return;

		}

		const indices = extractIndices(gBuffer);

		// If the output buffer uses low precision, enable sRGB encoding to reduce information loss.
		const useSRGB = (
			this.autoSRGB &&
			!this.frameBufferPrecisionHigh &&
			renderer.outputColorSpace === SRGBColorSpace
		);

		for(const entry of this.textureConfigs) {

			if(entry[1].isColorBuffer === true && indices.has(entry[0])) {

				const index = indices.get(entry[0])!;
				const texture = gBuffer.textures[index];
				texture.colorSpace = useSRGB ? SRGBColorSpace : NoColorSpace;
				texture.needsUpdate = true;

			}

		}

	}

	/**
	 * Updates the G-Buffer configuration.
	 */

	private updateGBuffer(): void {

		const output = this.output;
		const gBufferResource = this.gBufferResource;
		const gBufferComponents = this.gBufferComponents;

		if(!output.hasDefaultBuffer) {

			// Restore the default output buffer.
			output.defaultBuffer = this.gBufferResource;

		}

		// Dispose the current G-Buffer if it exists.
		gBufferResource.value?.dispose();

		if(gBufferComponents.size === 0) {

			// Fall back to the canvas.
			gBufferResource.value = null;
			output.defines.clear();
			return;

		}

		// Create a new G-Buffer.
		const { width, height } = this.resolution;
		const textureConfigs = this.textureConfigs;
		const renderTarget = new WebGLRenderTarget(width, height, {
			stencilBuffer: this.stencilBuffer,
			depthBuffer: this.depthBuffer,
			samples: this.samples,
			count: textureConfigs.length
		});

		for(let i = 0, l = textureConfigs.length; i < l; ++i) {

			const entry = textureConfigs[i];
			const texture = renderTarget.textures[i];
			const textureConfig = entry[1];
			texture.name = entry[0];
			texture.minFilter = textureConfig.minFilter;
			texture.magFilter = textureConfig.magFilter;
			texture.format = textureConfig.format;
			texture.type = textureConfig.type;

			if(textureConfig.internalFormat !== undefined) {

				texture.internalFormat = textureConfig.internalFormat;

			}

		}

		gBufferResource.value = renderTarget;
		this.configureDepthTexture();
		this.updateGBufferColorSpace();
		this.gBufferShaderPlugin.gBuffer = this.gBuffer;

	}

	/**
	 * Configures the depth texture.
	 *
	 * Uses the current {@link GBuffer.DEPTH} texture if available, or creates a new one.
	 */

	private configureDepthTexture(): void {

		const gBuffer = this.gBuffer;

		if(gBuffer === null) {

			return;

		}

		if(!this.gBufferComponents.has(GBuffer.DEPTH)) {

			gBuffer.depthTexture?.dispose();
			gBuffer.depthTexture = null;
			return;

		}

		const inputDepthTexture = this.input.getBuffer(GBuffer.DEPTH);

		if(inputDepthTexture !== null) {

			if(gBuffer.depthTexture !== inputDepthTexture) {

				gBuffer.depthTexture?.dispose();
				gBuffer.depthTexture = inputDepthTexture as DepthTexture;

			}

			return;

		}

		const depthTexture = new DepthTexture(1, 1);
		depthTexture.name = GBuffer.DEPTH;
		depthTexture.format = this.stencilBuffer ? DepthStencilFormat : DepthFormat;
		depthTexture.type = this.stencilBuffer ? UnsignedInt248Type : FloatType;
		gBuffer.depthTexture?.dispose();
		gBuffer.depthTexture = depthTexture;

	}

	/**
	 * Configures the internal {@link copyPass}.
	 */

	private configureCopyPass(): void {

		const inputBuffer = this.input.defaultBuffer?.value ?? null;
		const outputBuffer = this.output.defaultBuffer?.value ?? null;
		const inputIsOutput = (inputBuffer === outputBuffer?.texture);
		const outputIsMRT = ((outputBuffer?.textures.length ?? 0) > 1);

		this.copyPass.enabled = (inputBuffer !== null && !inputIsOutput && !outputIsMRT);

	}

	protected override onInputChange(): void {

		this.copyPass.input.defaultBuffer = this.input.defaultBuffer;

		if(this.input.buffers.has(GBuffer.DEPTH)) {

			this.copyPass.input.buffers.set(GBuffer.DEPTH, this.input.buffers.get(GBuffer.DEPTH)!);

		} else {

			this.copyPass.input.buffers.delete(GBuffer.DEPTH);

		}

		this.configureDepthTexture();
		this.configureCopyPass();

	}

	protected override onOutputChange(): void {

		if(!this.output.hasDefaultBuffer) {

			this.output.defaultBuffer = this.gBufferResource;

		}

		this.clearPass.output.defaultBuffer = this.output.defaultBuffer;
		this.copyPass.output.defaultBuffer = this.output.defaultBuffer;

		this.configureCopyPass();

	}

	protected override onResolutionChange(): void {

		// Use the same resolution settings for the copy pass.
		this.copyPass.resolution.copy(this.resolution);

		if(this.gBufferResource !== this.output.defaultBuffer) {

			// Set the size manually.
			this.gBufferResource?.value?.setSize(this.resolution.width, this.resolution.height);

		}

	}

	protected override onSceneChildAdded(object: Object3D): void {

		object.traverse((node) => this.updateMaterial(node));

	}

	protected override onScissorChange(): void {

		this.clearPass.scissor.copy(this.scissor);
		this.copyPass.scissor.copy(this.scissor);

	}

	protected override onViewportChange(): void {

		this.clearPass.viewport.copy(this.viewport);
		this.copyPass.viewport.copy(this.viewport);

	}

	override async compile(): Promise<void> {

		if(this.renderer === null || this.scene === null || this.camera === null) {

			return;

		}

		const promises: Promise<Object3D | void>[] = [];
		promises.push(super.compile());
		promises.push(this.renderer.compileAsync(this.scene, this.camera));
		await Promise.all(promises);

	}

	override render(): void {

		const renderer = this.renderer;
		const scene = this.scene;
		const camera = this.camera;

		if(renderer === null || scene === null || camera === null) {

			return;

		}

		this.renderSubpasses();

		// The background is rendered by the ClearPass.
		const background = scene.background;
		scene.background = null;

		const mask = camera.layers.mask;

		if(this.selection.enabled) {

			camera.layers.set(this.selection.layer);

		}

		this.setRenderTarget(this.output.defaultBuffer?.value);
		renderer.render(scene, camera);

		// Restore the original values.
		camera.layers.mask = mask;
		scene.background = background;

	}

}
