import {
	DepthStencilFormat,
	DepthTexture,
	FloatType,
	LinearFilter,
	NearestFilter,
	OrthographicCamera,
	PerspectiveCamera,
	SRGBColorSpace,
	Scene,
	TextureDataType,
	UnsignedByteType,
	UnsignedInt248Type,
	WebGLMultipleRenderTargets,
	WebGLRenderTarget,
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
		frameBufferType = UnsignedByteType,
		samples = 0
	}: GeometryPassOptions = {}) {

		super("GeometryPass");

		this.scene = scene;
		this.camera = camera;

		this.frameBufferType = frameBufferType;
		this._samples = samples;

		this.selection = new Selection();
		this.selection.enabled = false;
		this.ignoreBackground = false;
		this.skipShadowMapUpdate = false;

		const gBufferComponents = new ObservableSet<GBuffer>();
		gBufferComponents.addEventListener(ObservableSet.EVENT_CHANGE, () => this.updateGBuffer());
		this.gBufferComponents = gBufferComponents;

	}

	override get renderer(): WebGLRenderer | null {

		return super.renderer;

	}

	override set renderer(value: WebGLRenderer | null) {

		super.renderer = value;

		const renderTarget = this.output.defaultBuffer as WebGLRenderTarget;
		const type = this.frameBufferType;

		if(renderTarget !== null && type === UnsignedByteType && value?.outputColorSpace === SRGBColorSpace) {

			renderTarget.texture.colorSpace = SRGBColorSpace;

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
		const useDepthTexture = gBufferComponents.has(GBuffer.DEPTH) || gBufferComponents.has(GBuffer.NORMAL_DEPTH);

		const renderTarget = new WebGLMultipleRenderTargets(1, 1, 2, {
			depthBuffer: !useDepthTexture,
			stencilBuffer: true,
			samples: this.samples
		});

		const textures = renderTarget.texture;
		textures[0].name = GBuffer.COLOR;
		textures[0].minFilter = LinearFilter;
		textures[0].magFilter = LinearFilter;
		textures[0].type = this.frameBufferType;
		textures[1].name = GBuffer.NORMAL;
		textures[1].minFilter = NearestFilter;
		textures[1].magFilter = NearestFilter;
		textures[1].type = FloatType;

		if(useDepthTexture) {

			const depthTexture = new DepthTexture(1, 1);
			depthTexture.format = DepthStencilFormat;
			depthTexture.type = UnsignedInt248Type;
			renderTarget.depthTexture = depthTexture;

		}


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
