import {
	DepthFormat,
	DepthStencilFormat,
	DepthTexture,
	FloatType,
	HalfFloatType,
	LinearFilter,
	Material,
	Mesh,
	NearestFilter,
	NoColorSpace,
	Object3D,
	OrthographicCamera,
	PerspectiveCamera,
	RGBAFormat,
	RGBFormat,
	SRGBColorSpace,
	Scene,
	TextureDataType,
	UnsignedByteType,
	UnsignedInt248Type,
	UnsignedIntType,
	WebGLProgramParametersWithUniforms,
	WebGLRenderTarget,
	WebGLRenderer
} from "three";

import { RenderTargetResource } from "../core/io/RenderTargetResource.js";
import { Pass } from "../core/Pass.js";
import { Selective } from "../core/Selective.js";
import { GBuffer } from "../enums/GBuffer.js";
import { MSAASamples } from "../enums/MSAASamples.js";
import { GBufferConfig } from "../utils/GBufferConfig.js";
import { GBufferTextureConfig } from "../utils/GBufferTextureConfig.js";
import { extractIndices, extractOutputDefinitions } from "../utils/GBufferUtils.js";
import { ObservableSet } from "../utils/ObservableSet.js";
import { Selection } from "../utils/Selection.js";
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
	 * @defaultValue true
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

}

/**
 * A geometry pass.
 *
 * @category Passes
 */

export class GeometryPass extends Pass implements GeometryPassOptions, Selective {

	readonly selection: Selection;

	/**
	 * A collection of materials that have been modified with `onBeforeCompile`.
	 */

	private readonly registeredMaterials: WeakSet<Material>;

	/**
	 * A pass that copies the default input buffer to the output color buffer.
	 */

	private readonly copyPass: CopyPass;

	/**
	 * A resource that wraps the G-Buffer.
	 */

	private readonly gBufferResource: RenderTargetResource;

	/**
	 * Controls which G-Buffer components should be rendered by this pass.
	 *
	 * This will automatically be configured based on the requirements of other passes in the same pipeline.
	 *
	 * @internal
	 */

	readonly gBufferComponents: Set<GBuffer | string>;

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

	// #endregion

	/**
	 * Constructs a new geometry pass.
	 *
	 * @param scene - A scene.
	 * @param camera - A camera.
	 * @param options - Additional options.
	 */

	constructor(scene: Scene, camera: OrthographicCamera | PerspectiveCamera, {
		alpha = true,
		stencilBuffer = false,
		depthBuffer = true,
		frameBufferType = HalfFloatType,
		samples = 0,
		gBufferConfig = new GBufferConfig()
	}: GeometryPassOptions = {}) {

		super("GeometryPass");

		this.alpha = alpha;
		this.stencilBuffer = stencilBuffer;
		this.depthBuffer = depthBuffer;
		this.frameBufferType = frameBufferType;
		this._samples = samples;

		this.selection = new Selection();
		this.selection.enabled = false;
		this.gBufferConfig = gBufferConfig;
		this.registeredMaterials = new WeakSet<Material>();
		this.copyPass = new CopyPass();
		this.copyPass.enabled = false;
		this.subpasses = [this.copyPass];

		const gBufferComponents = new ObservableSet<GBuffer | string>();
		gBufferComponents.addEventListener("change", () => this.updateGBuffer());
		this.gBufferComponents = gBufferComponents;
		this.gBufferResource = new RenderTargetResource();
		this.output.defaultBuffer = this.gBufferResource;

		this.scene = scene;
		this.camera = camera;

		this.updateTextureConfigs();
		this.updateGBuffer();

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

		const buffer = this.output.defaultBuffer?.value ?? null;

		if(buffer !== null && buffer.samples !== value) {

			buffer.samples = value;
			buffer.dispose();

		}

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
		this.updateOutputBufferColorSpace();

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
			type: this.frameBufferType,
			format: useSmallFloatFormat ? RGBFormat : RGBAFormat,
			internalFormat: useSmallFloatFormat ? "R11F_G11F_B10F" : undefined,
			isColorBuffer: true
		});

		textureConfigs.set(GBuffer.NORMAL, {
			minFilter: NearestFilter,
			magFilter: NearestFilter,
			type: HalfFloatType,
			format: RGBAFormat,
			isColorBuffer: false
		});

		textureConfigs.set(GBuffer.ORM, {
			minFilter: LinearFilter,
			magFilter: LinearFilter,
			type: UnsignedByteType,
			format: RGBAFormat,
			isColorBuffer: false
		});

		textureConfigs.set(GBuffer.EMISSION, {
			minFilter: LinearFilter,
			magFilter: LinearFilter,
			type: this.frameBufferType,
			format: useSmallFloatFormat ? RGBFormat : RGBAFormat,
			internalFormat: useSmallFloatFormat ? "R11F_G11F_B10F" : undefined,
			isColorBuffer: true
		});

	}

	/**
	 * Enables rendering to {@link GBuffer} components for the materials of a given mesh.
	 *
	 * Should be called when a material is added, removed or replaced at runtime.
	 *
	 * TODO Remove when `three` supports output layout definitions for MRT.
	 *
	 * @param object - The object to update.
	 */

	private updateMaterial(object: Object3D): void {

		if(!(object instanceof Mesh)) {

			return;

		}

		const mesh = object as Mesh;

		for(const material of Array.isArray(mesh.material) ? mesh.material : [mesh.material]) {

			if(this.registeredMaterials.has(material)) {

				return;

			}

			this.registeredMaterials.add(material);

			/* eslint-disable @typescript-eslint/unbound-method */
			const onBeforeCompile = material.onBeforeCompile;

			material.onBeforeCompile = (shader: WebGLProgramParametersWithUniforms, renderer: WebGLRenderer) => {

				// Workaround for troika-three-text, see #660.
				if(material.onBeforeCompile !== onBeforeCompile) {

					onBeforeCompile.call(material, shader, renderer);

				}

				if(this.gBuffer !== null) {

					const outputDefinitions = extractOutputDefinitions(this.gBuffer);
					shader.fragmentShader = outputDefinitions + "\n\n" + shader.fragmentShader;

				}

			};

		}

	}

	/**
	 * Updates the color space of the output buffers.
	 */

	private updateOutputBufferColorSpace(): void {

		const gBuffer = this.gBuffer;
		const renderer = this.renderer;

		if(gBuffer === null || renderer === null) {

			return;

		}

		const indices = extractIndices(gBuffer);
		const useSRGB = (!this.frameBufferPrecisionHigh && renderer.outputColorSpace === SRGBColorSpace);
		const colorSpace = useSRGB ? SRGBColorSpace : NoColorSpace;

		for(const entry of this.textureConfigs) {

			if(entry[1].isColorBuffer && indices.has(entry[0])) {

				const index = indices.get(entry[0])!;
				gBuffer.textures[index].colorSpace = colorSpace;

			}

		}

	}

	/**
	 * Updates the G-Buffer configuration.
	 */

	private updateGBuffer(): void {

		const output = this.output;
		const gBufferComponents = this.gBufferComponents;

		if(!output.hasDefaultBuffer) {

			output.defaultBuffer = this.gBufferResource;

		} else if(output.defaultBuffer !== this.gBufferResource) {

			// Don't modify foreign resources.
			return;

		}

		// Dispose the current G-Buffer if it exists.
		output.defaultBuffer.value?.depthTexture?.dispose();
		output.defaultBuffer.value?.dispose();

		if(gBufferComponents.size === 0) {

			// Fall back to the canvas.
			output.defaultBuffer = null;
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

		output.defaultBuffer = renderTarget;
		this.configureDepthTexture();
		this.updateOutputBufferColorSpace();

	}

	/**
	 * Configures the depth texture.
	 *
	 * Uses the current {@link GBuffer.DEPTH} texture if available, or creates a new one.
	 */

	private configureDepthTexture(): void {

		const output = this.output;

		if(output.defaultBuffer !== this.gBufferResource) {

			// Don't modify foreign resources.
			return;

		}

		const outputBuffer = output.defaultBuffer?.value ?? null;

		if(outputBuffer === null) {

			return;

		}

		if(!this.gBufferComponents.has(GBuffer.DEPTH)) {

			outputBuffer.depthTexture?.dispose();
			outputBuffer.depthTexture = null;
			return;

		}

		const inputDepthTexture = this.input.getBuffer(GBuffer.DEPTH);

		if(inputDepthTexture !== null) {

			if(outputBuffer.depthTexture !== inputDepthTexture) {

				outputBuffer.depthTexture?.dispose();
				outputBuffer.depthTexture = inputDepthTexture as DepthTexture;

			}

		} else {

			const depthTexture = new DepthTexture(1, 1);
			depthTexture.name = GBuffer.DEPTH;
			depthTexture.format = this.stencilBuffer ? DepthStencilFormat : DepthFormat;
			depthTexture.type = this.stencilBuffer ? UnsignedInt248Type : UnsignedIntType;
			outputBuffer.depthTexture?.dispose();
			outputBuffer.depthTexture = depthTexture;

		}

	}

	/**
	 * Updates the settings of the internal copy pass.
	 */

	private updateCopyPass(): void {

		const inputBuffer = this.input.defaultBuffer?.value ?? null;
		const outputBuffer = this.output.defaultBuffer?.value ?? null;
		const inputIsOutput = (inputBuffer === outputBuffer?.texture);
		const outputIsMRT = ((outputBuffer?.textures.length ?? 0) > 1);

		this.copyPass.enabled = (inputBuffer !== null && !inputIsOutput && !outputIsMRT);

	}

	protected override onInputChange(): void {

		this.configureDepthTexture();

		const copyPass = this.copyPass;
		copyPass.input.defaultBuffer = this.input.defaultBuffer;
		this.updateCopyPass();

		if(this.input.buffers.has(GBuffer.DEPTH)) {

			copyPass.input.buffers.set(GBuffer.DEPTH, this.input.buffers.get(GBuffer.DEPTH)!);

		} else {

			copyPass.input.buffers.delete(GBuffer.DEPTH);

		}

	}

	protected override onOutputChange(): void {

		if(!this.output.hasDefaultBuffer) {

			// Silently restore the G-Buffer to avoid a nested double update.
			// The render pipeline will be updated right after this hook.
			this.gBufferResource.mute();
			this.updateGBuffer();
			this.gBufferResource.unmute();

		} else {

			this.configureDepthTexture();

		}

		this.copyPass.output.defaultBuffer = this.output.defaultBuffer;
		this.updateCopyPass();

	}

	protected override onResolutionChange(): void {

		// Use the same resolution settings for the copy pass.
		this.copyPass.resolution.copy(this.resolution);

	}

	protected override onSceneChildAdded(object: Object3D): void {

		object.traverse((node) => this.updateMaterial(node));

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

		const { renderer, scene, camera } = this;

		if(renderer === null || scene === null || camera === null) {

			return;

		}

		const mask = camera.layers.mask;
		const background = scene.background;

		// The background is rendered by the ClearPass, if present.
		scene.background = null;

		if(this.selection.enabled) {

			camera.layers.set(this.selection.layer);

		}

		if(this.copyPass.enabled) {

			this.copyPass.render();

		}

		this.setRenderTarget(this.output.defaultBuffer?.value);
		renderer.render(scene, camera);

		// Restore the original values.
		camera.layers.mask = mask;
		scene.background = background;

	}

}
