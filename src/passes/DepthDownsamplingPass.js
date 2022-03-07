import { BasicDepthPacking, FloatType, NearestFilter, WebGLRenderTarget } from "three";
import { Resolution } from "../core/Resolution";
import { DepthDownsamplingMaterial } from "../materials";
import { Pass } from "./Pass";

/**
 * A pass that downsamples the scene depth by picking the most representative depth in 2x2 texel neighborhoods. If a
 * normal buffer is provided, the corresponding normals will be stored as well.
 *
 * This pass requires WebGL 2.
 */

export class DepthDownsamplingPass extends Pass {

	/**
	 * Constructs a new depth downsampling pass.
	 *
	 * @param {Object} [options] - The options.
	 * @param {Texture} [options.normalBuffer=null] - A texture that contains view space normals. See {@link NormalPass}.
	 * @param {Number} [options.resolutionScale=0.5] - The resolution scale.
	 * @param {Number} [options.width=Resolution.AUTO_SIZE] - The render width.
	 * @param {Number} [options.height=Resolution.AUTO_SIZE] - The render height.
	 */

	constructor({
		normalBuffer = null,
		resolutionScale = 0.5,
		width = Resolution.AUTO_SIZE,
		height = Resolution.AUTO_SIZE
	} = {}) {

		super("DepthDownsamplingPass");

		const material = new DepthDownsamplingMaterial();
		material.normalBuffer = normalBuffer;
		this.fullscreenMaterial = material;
		this.needsDepthTexture = true;
		this.needsSwap = false;

		/**
		 * A render target that contains the downsampled normals and depth.
		 *
		 * Normals are stored as RGB and depth as alpha.
		 *
		 * @type {WebGLRenderTarget}
		 * @private
		 */

		this.renderTarget = new WebGLRenderTarget(1, 1, {
			minFilter: NearestFilter,
			magFilter: NearestFilter,
			stencilBuffer: false,
			depthBuffer: false,
			type: FloatType
		});

		this.renderTarget.texture.name = "DepthDownsamplingPass.Target";
		this.renderTarget.texture.generateMipmaps = false;

		/**
		 * The resolution.
		 *
		 * @type {Resolution}
		 * @deprecated Use getResolution() instead.
		 */

		const resolution = this.resolution = new Resolution(this, width, height, resolutionScale);
		resolution.addEventListener("change", (e) => this.setSize(resolution.baseWidth, resolution.baseHeight));

	}

	/**
	 * The normal(RGB) + depth(A) texture.
	 *
	 * @type {Texture}
	 */

	get texture() {

		return this.renderTarget.texture;

	}

	/**
	 * Returns the normal(RGB) + depth(A) texture.
	 *
	 * @deprecated Use texture instead.
	 * @return {Texture} The texture.
	 */

	getTexture() {

		return this.renderTarget.texture;

	}

	/**
	 * Returns the resolution settings.
	 *
	 * @return {Resolution} The resolution.
	 */

	getResolution() {

		return this.resolution;

	}

	/**
	 * Sets the depth texture.
	 *
	 * @param {Texture} depthTexture - A depth texture.
	 * @param {DepthPackingStrategies} [depthPacking=BasicDepthPacking] - The depth packing strategy.
	 */

	setDepthTexture(depthTexture, depthPacking = BasicDepthPacking) {

		this.fullscreenMaterial.depthBuffer = depthTexture;
		this.fullscreenMaterial.depthPacking = depthPacking;

	}

	/**
	 * Downsamples depth and scene normals.
	 *
	 * @param {WebGLRenderer} renderer - The renderer.
	 * @param {WebGLRenderTarget} inputBuffer - A frame buffer that contains the result of the previous pass.
	 * @param {WebGLRenderTarget} outputBuffer - A frame buffer that serves as the output render target unless this pass renders to screen.
	 * @param {Number} [deltaTime] - The time between the last frame and the current one in seconds.
	 * @param {Boolean} [stencilTest] - Indicates whether a stencil mask is active.
	 */

	render(renderer, inputBuffer, outputBuffer, deltaTime, stencilTest) {

		renderer.setRenderTarget(this.renderToScreen ? null : this.renderTarget);
		renderer.render(this.scene, this.camera);

	}

	/**
	 * Updates the size of this pass.
	 *
	 * @param {Number} width - The width.
	 * @param {Number} height - The height.
	 */

	setSize(width, height) {

		// Use the full resolution to calculate the depth/normal buffer texel size.
		this.fullscreenMaterial.setSize(width, height);

		const resolution = this.resolution;
		resolution.setBaseSize(width, height);
		this.renderTarget.setSize(resolution.width, resolution.height);

	}

	/**
	 * Performs initialization tasks.
	 *
	 * @param {WebGLRenderer} renderer - The renderer.
	 * @param {Boolean} alpha - Whether the renderer uses the alpha channel or not.
	 * @param {Number} frameBufferType - The type of the main frame buffers.
	 */

	initialize(renderer, alpha, frameBufferType) {

		if(!renderer.capabilities.isWebGL2) {

			console.error("The DepthDownsamplingPass requires WebGL 2");

		}

	}

}
