import {
	DepthFormat,
	DepthStencilFormat,
	DepthTexture,
	HalfFloatType,
	LinearFilter,
	NearestFilter,
	OrthographicCamera,
	PerspectiveCamera,
	RGFormat,
	SRGBColorSpace,
	Scene,
	TextureDataType,
	UnsignedByteType,
	UnsignedInt248Type,
	UnsignedIntType,
	WebGLMultipleRenderTargets,
	WebGLRenderer
} from "three";

import { Pass } from "../core/Pass.js";
import { Selective } from "../core/Selective.js";
import { Selection } from "../utils/Selection.js";
import { ObservableSet } from "../utils/ObservableSet.js";
import { GBuffer } from "../enums/GBuffer.js";
import { Resolution } from "../utils/Resolution.js";

/**
 * Supported MSAA sample counts.
 */

export declare type MSAASamples = 0 | 2 | 4 | 8;

/**
 * GeometryPass constructor options.
 */

interface GeometryPassOptions {

	/**
	 * Determines whether a stencil buffer should be created.
	 */

	stencil?: boolean;

	/**
	 * The type of the color buffer.
	 */

	frameBufferType?: TextureDataType;

	/**
	 * The amount of samples used for MSAA. Default is 0.
	 *
	 * Will be limited to the maximum value supported by the device.
	 */

	samples?: MSAASamples;

}

/**
 * A geometry pass.
 */

export class GeometryPass extends Pass implements Selective {

	readonly selection: Selection;

	/**
	 * Controls which gBuffer components should be rendered by this pass.
	 *
	 * This will be automatically configured based on the requirements of other passes in the same pipeline.
	 */

	readonly gBufferComponents: Set<GBuffer>;

	/**
	 * Indicates whether the scene background should be ignored.
	 */

	ignoreBackground: boolean;

	/**
	 * Indicates whether the shadow map auto update should be skipped.
	 */

	skipShadowMapUpdate: boolean;

	/**
	 * Indicates whether a stencil buffer should be created.
	 */

	private readonly stencil: boolean;

	/**
	 * The texture data type of the primary color buffer.
	 */

	private readonly frameBufferType: TextureDataType;

	/**
	 * @see {@link samples}
	 */

	private _samples: MSAASamples;

	/**
	 * Constructs a new geometry pass.
	 *
	 * @param scene - A scene.
	 * @param camera - A camera.
	 * @param options - Additional options.
	 */

	constructor(scene: Scene, camera: OrthographicCamera | PerspectiveCamera, {
		stencil = false,
		frameBufferType = UnsignedByteType,
		samples = 0
	}: GeometryPassOptions = {}) {

		super("GeometryPass");

		this.scene = scene;
		this.camera = camera;

		this.stencil = stencil;
		this.frameBufferType = frameBufferType;
		this._samples = samples;

		this.selection = new Selection();
		this.selection.enabled = false;
		this.ignoreBackground = false;
		this.skipShadowMapUpdate = false;

		const gBufferComponents = new ObservableSet<GBuffer>([GBuffer.COLOR]);
		gBufferComponents.addEventListener(ObservableSet.EVENT_CHANGE, () => this.updateGBuffer());
		this.gBufferComponents = gBufferComponents;
		this.updateGBuffer();

	}

	override get renderer(): WebGLRenderer | null {

		return super.renderer;

	}

	override set renderer(value: WebGLRenderer | null) {

		super.renderer = value;

		const renderTarget = this.output.defaultBuffer as WebGLMultipleRenderTargets;
		const type = this.frameBufferType;

		if(renderTarget !== null && type === UnsignedByteType && value?.outputColorSpace === SRGBColorSpace) {

			renderTarget.texture[0].colorSpace = SRGBColorSpace;

		}

	}

	protected override onResolutionChange(resolution: Resolution): void {

		this.output.defaultBuffer?.setSize(resolution.width, resolution.height);

	}

	/**
	 * Sets the amount of MSAA samples.
	 */

	get samples(): MSAASamples {

		return this._samples;

	}

	set samples(value: MSAASamples) {

		this._samples = value;

		if(this.output.defaultBuffer !== null) {

			this.output.defaultBuffer.samples = value;

		}

	}

	/**
	 * Updates the gBuffer configuration.
	 */

	private updateGBuffer(): void {

		const gBufferComponents = this.gBufferComponents;
		const useDepthTexture = gBufferComponents.has(GBuffer.DEPTH);

		const exclusions = new Set<GBuffer>([GBuffer.DEPTH, GBuffer.METALNESS]);
		const textureCount = Array.from(gBufferComponents).filter((x) => !exclusions.has(x)).length;

		const renderTarget = new WebGLMultipleRenderTargets(1, 1, textureCount, {
			stencilBuffer: this.stencil && !useDepthTexture,
			depthBuffer: !useDepthTexture,
			samples: this.samples
		});

		const textures = renderTarget.texture;
		const defines = this.output.defines as Map<GBuffer, number>;
		defines.clear();

		let index = 0;

		if(gBufferComponents.has(GBuffer.COLOR)) {

			textures[index].name = GBuffer.COLOR;
			textures[index].minFilter = LinearFilter;
			textures[index].magFilter = LinearFilter;
			textures[index].type = this.frameBufferType;

			if(this.frameBufferType === UnsignedByteType && this.renderer?.outputColorSpace === SRGBColorSpace) {

				textures[index].colorSpace = SRGBColorSpace;

			}

			defines.set(GBuffer.COLOR, index++);

		}

		if(gBufferComponents.has(GBuffer.NORMAL)) {

			textures[index].name = GBuffer.NORMAL;
			textures[index].minFilter = NearestFilter;
			textures[index].magFilter = NearestFilter;
			textures[index].type = HalfFloatType;
			defines.set(GBuffer.NORMAL, index++);

		}

		if(gBufferComponents.has(GBuffer.ROUGHNESS)) {

			textures[index].name = GBuffer.ROUGHNESS;
			textures[index].minFilter = LinearFilter;
			textures[index].magFilter = LinearFilter;
			textures[index].type = UnsignedByteType;
			textures[index].format = RGFormat;
			defines.set(GBuffer.ROUGHNESS, index++);

		}

		if(gBufferComponents.has(GBuffer.METALNESS)) {

			defines.set(GBuffer.METALNESS, defines.get(GBuffer.ROUGHNESS) as number);

		}

		if(useDepthTexture) {

			const depthTexture = new DepthTexture(1, 1);
			depthTexture.format = this.stencil ? DepthStencilFormat : DepthFormat;
			depthTexture.type = this.stencil ? UnsignedInt248Type : UnsignedIntType;
			renderTarget.depthTexture = depthTexture;

		}

		this.output.defaultBuffer?.dispose();
		this.output.defaultBuffer = renderTarget;

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

		if(this.skipShadowMapUpdate) {

			this.renderer.shadowMap.autoUpdate = false;

		}

		if(this.ignoreBackground) {

			this.scene.background = null;

		}

		this.renderer.setRenderTarget(this.output.defaultBuffer);
		this.renderer.render(this.scene, this.camera);

		// Restore original values.
		this.camera.layers.mask = mask;
		this.scene.background = background;
		this.renderer.shadowMap.autoUpdate = shadowMapAutoUpdate;

	}

}
