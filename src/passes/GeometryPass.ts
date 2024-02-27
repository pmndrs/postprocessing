import {
	DepthFormat,
	DepthStencilFormat,
	DepthTexture,
	HalfFloatType,
	LinearFilter,
	Material,
	Mesh,
	NearestFilter,
	NoColorSpace,
	OrthographicCamera,
	PerspectiveCamera,
	RGBAFormat,
	SRGBColorSpace,
	Scene,
	TextureDataType,
	UnsignedByteType,
	WebGLMultipleRenderTargets,
	WebGLProgramParametersWithUniforms,
	WebGLRenderer
} from "three";

import { Resource } from "../core/io/Resource.js";
import { Pass } from "../core/Pass.js";
import { Selective } from "../core/Selective.js";
import { GBuffer } from "../enums/GBuffer.js";
import { MSAASamples } from "../enums/MSAASamples.js";
import { GBufferConfig } from "../utils/GBufferConfig.js";
import { extractIndices, extractOutputDefinitions } from "../utils/GBufferUtils.js";
import { ObservableSet } from "../utils/ObservableSet.js";
import { Selection } from "../utils/Selection.js";
import { CopyPass } from "./CopyPass.js";
import { GBufferTextureConfig } from "../utils/GBufferTextureConfig.js";

/**
 * GeometryPass constructor options.
 *
 * @category Passes
 */

export interface GeometryPassOptions {

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
	 * The type of the color buffer.
	 *
	 * @defaultValue {@link UnsignedByteType}
	 */

	frameBufferType?: TextureDataType;

	/**
	 * The amount of samples used for MSAA.
	 *
	 * Will be limited to the maximum value supported by the device.
	 *
	 * @defaultValue 0
	 */

	samples?: MSAASamples;

	/**
	 * A custom G-Buffer configuration.
	 */

	gBufferConfig?: GBufferConfig;

}

/**
 * A geometry pass.
 *
 * @category Passes
 */

export class GeometryPass extends Pass implements Selective {

	readonly selection: Selection;

	/**
	 * The G-Buffer configuration.
	 */

	readonly gBufferConfig: GBufferConfig;

	/**
	 * A collection of materials that have been modified with `onBeforeCompile`.
	 */

	private readonly registeredMaterials: WeakSet<Material>;

	/**
	 * A copy pass that is used to blit the default input buffer to the output color buffer.
	 */

	private readonly copyPass: CopyPass;

	/**
	 * Controls which G-Buffer components should be rendered by this pass.
	 *
	 * This will be automatically configured based on the requirements of other passes in the same pipeline.
	 *
	 * @internal
	 */

	readonly gBufferComponents: Set<GBuffer | string>;

	// #region Settings

	/**
	 * Indicates whether a stencil buffer should be created.
	 */

	readonly stencilBuffer: boolean;

	/**
	 * Indicates whether a depth buffer should be created.
	 */

	readonly depthBuffer: boolean;

	/**
	 * The texture data type of the primary color buffer.
	 */

	readonly frameBufferType: TextureDataType;

	/**
	 * The current G-Buffer resource.
	 */

	private gBufferResource: Resource | null;

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
		stencilBuffer = false,
		depthBuffer = true,
		frameBufferType = UnsignedByteType,
		samples = 0,
		gBufferConfig = new GBufferConfig()
	}: GeometryPassOptions = {}) {

		super("GeometryPass");

		this.scene = scene;
		this.camera = camera;

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
		gBufferComponents.addEventListener(ObservableSet.EVENT_CHANGE, () => this.updateGBuffer());
		this.gBufferComponents = gBufferComponents;
		this.gBufferResource = null;

		this.updateTextureConfigs();
		this.updateGBuffer();
		this.updateMaterials();

	}

	/**
	 * Sets the amount of MSAA samples.
	 */

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
	 * Returns the G-Buffer render target, or null if the buffer is not of type `WebGLMultipleRenderTargets`.
	 */

	get gBuffer(): WebGLMultipleRenderTargets | null {

		const buffer = this.output.defaultBuffer?.value ?? null;
		return buffer instanceof WebGLMultipleRenderTargets ? buffer : null;

	}

	/**
	 * Returns the G-Buffer texture configs that correspond to the current G-Buffer components.
	 */

	private get textureConfigs(): Array<[string, GBufferTextureConfig]> {

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
	 * Defines the primary G-Buffer texture configs.
	 */

	private updateTextureConfigs(): void {

		const textureConfigs = this.gBufferConfig.textureConfigs;

		textureConfigs.set(GBuffer.COLOR, {
			minFilter: LinearFilter,
			magFilter: LinearFilter,
			type: this.frameBufferType,
			format: RGBAFormat,
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
			format: RGBAFormat,
			isColorBuffer: true
		});

	}

	/**
	 * Enables rendering to {@link GBuffer} components for a given material.
	 *
	 * @todo Remove when three supports output layout definitions for MRT.
	 * @param material - The material.
	 */

	private updateMaterial(material: Material): void {

		if(this.registeredMaterials.has(material)) {

			return;

		}

		this.registeredMaterials.add(material);
		const onBeforeCompile = material.onBeforeCompile.bind(this);

		material.onBeforeCompile = (shader: WebGLProgramParametersWithUniforms, renderer: WebGLRenderer) => {

			onBeforeCompile(shader, renderer);

			if(this.gBuffer === null) {

				return;

			}

			const outputDefinitions = extractOutputDefinitions(this.gBuffer);
			shader.fragmentShader = outputDefinitions + "\n\n" + shader.fragmentShader;

		};

	}

	/**
	 * Enables rendering to {@link GBuffer} components for all materials in a given scene.
	 *
	 * Should be called when a mesh or material is added, removed or replaced at runtime.
	 *
	 * @todo Remove when three supports output layout definitions for MRT.
	 * @param scene - The scene, or a subset of a scene.
	 */

	updateMaterials(scene = this.scene): void {

		scene?.traverse((node) => {

			const mesh = (node instanceof Mesh) ? node as Mesh : null;

			if(mesh === null) {

				return;

			}

			for(const material of Array.isArray(mesh.material) ? mesh.material : [mesh.material]) {

				this.updateMaterial(material);

			}

		});

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
		const useSRGB = (this.frameBufferType === UnsignedByteType && renderer.outputColorSpace === SRGBColorSpace);
		const colorSpace = useSRGB ? SRGBColorSpace : NoColorSpace;

		for(const entry of this.textureConfigs) {

			if(entry[1].isColorBuffer && indices.has(entry[0])) {

				const index = indices.get(entry[0]) as number;
				gBuffer.texture[index].colorSpace = colorSpace;

			}

		}

	}

	/**
	 * Updates the G-Buffer configuration.
	 */

	private updateGBuffer(): void {

		if(this.output.defaultBuffer !== this.gBufferResource) {

			// Don't modify foreign resources.
			return;

		}

		const gBufferComponents = this.gBufferComponents;
		this.output.defaultBuffer?.value?.dispose();

		if(gBufferComponents.size === 0) {

			this.output.defaultBuffer = null;
			this.gBufferResource = this.output.defaultBuffer;
			this.output.defines.clear();

			return;

		}

		const { width, height } = this.resolution;
		const textureConfigs = this.textureConfigs;
		const renderTarget = new WebGLMultipleRenderTargets(width, height, textureConfigs.length, {
			stencilBuffer: this.stencilBuffer,
			depthBuffer: this.depthBuffer,
			samples: this.samples
		});

		const textures = renderTarget.texture;
		let index = 0;

		for(const entry of textureConfigs) {

			const texture = textures[index++];
			const textureConfig = entry[1];
			texture.name = entry[0];
			texture.minFilter = textureConfig.minFilter;
			texture.magFilter = textureConfig.magFilter;
			texture.format = textureConfig.format;
			texture.type = textureConfig.type;

		}

		if(gBufferComponents.has(GBuffer.DEPTH)) {

			const depthTexture = new DepthTexture(1, 1);
			depthTexture.name = GBuffer.DEPTH;
			depthTexture.format = this.stencilBuffer ? DepthStencilFormat : DepthFormat;
			renderTarget.depthTexture = depthTexture;

		}

		this.output.defaultBuffer = renderTarget;
		this.gBufferResource = this.output.defaultBuffer;
		this.updateOutputBufferColorSpace();

	}

	protected override onInputChange(): void {

		this.copyPass.input.defaultBuffer = this.input.defaultBuffer;

		if(this.input.buffers.has(GBuffer.DEPTH)) {

			this.copyPass.input.buffers.set(GBuffer.DEPTH, this.input.buffers.get(GBuffer.DEPTH)!);

		} else {

			this.copyPass.input.buffers.delete(GBuffer.DEPTH);

		}

		const inputBuffer = this.input.defaultBuffer?.value ?? null;
		this.copyPass.enabled = inputBuffer !== null && this.gBuffer !== null;

	}

	protected override onOutputChange(): void {

		this.copyPass.output.defaultBuffer = this.output.defaultBuffer;

	}

	render(): void {

		if(this.renderer === null || this.scene === null || this.camera === null) {

			return;

		}

		const selection = this.selection;
		const mask = this.camera.layers.mask;
		const background = this.scene.background;
		const shadowMapAutoUpdate = this.renderer.shadowMap.autoUpdate;

		if(this.selection.enabled) {

			this.camera.layers.set(selection.layer);

		}

		if(this.copyPass.enabled) {

			this.copyPass.render();

		}

		this.renderer.setRenderTarget(this.output.defaultBuffer?.value ?? null);
		this.renderer.render(this.scene, this.camera);

		// Restore the original values.
		this.camera.layers.mask = mask;
		this.scene.background = background;
		this.renderer.shadowMap.autoUpdate = shadowMapAutoUpdate;

	}

}
