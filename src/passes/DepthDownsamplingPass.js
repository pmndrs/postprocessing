import { FloatType, NearestFilter, WebGLRenderTarget } from "three";

import { Resizer } from "../core/Resizer.js";
import { DepthDownsamplingMaterial } from "../materials";
import { Pass } from "./Pass.js";

/**
 * A pass that downsamples the scene depth by picking the most representative
 * depth in 2x2 texel neighborhoods. If a normal buffer is provided, the
 * corresponding normals will be stored as well.
 *
 * Attention: This pass requires WebGL 2.
 */

export class DepthDownsamplingPass extends Pass {

	/**
	 * Constructs a new depth downsampling pass.
	 *
	 * @param {Object} [options] - The options.
	 * @param {Texture} [options.normalBuffer=null] - A texture that contains view space normals. See {@link NormalPass}.
	 * @param {Number} [options.resolutionScale=0.5] - The resolution scale.
	 * @param {Number} [options.width=Resizer.AUTO_SIZE] - The render width.
	 * @param {Number} [options.height=Resizer.AUTO_SIZE] - The render height.
	 */

	constructor({
		normalBuffer = null,
		resolutionScale = 0.5,
		width = Resizer.AUTO_SIZE,
		height = Resizer.AUTO_SIZE
	} = {}) {

		super("DepthDownsamplingPass");

		this.setFullscreenMaterial(new DepthDownsamplingMaterial());
		this.needsDepthTexture = true;
		this.needsSwap = false;

		if(normalBuffer !== null) {

			const material = this.getFullscreenMaterial();
			material.uniforms.normalBuffer.value = normalBuffer;
			material.defines.DOWNSAMPLE_NORMALS = "1";

		}

		/**
		 * A render target that contains the downsampled normals and depth.
		 *
		 * Normals are stored as RGB and depth is stored as alpha.
		 *
		 * @type {WebGLRenderTarget}
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
		 * The resolution of this effect.
		 *
		 * @type {Resizer}
		 */

		this.resolution = new Resizer(this, width, height);
		this.resolution.scale = resolutionScale;

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
	 * Sets the depth texture.
	 *
	 * @param {Texture} depthTexture - A depth texture.
	 * @param {Number} [depthPacking=0] - The depth packing.
	 */

	setDepthTexture(depthTexture, depthPacking = 0) {

		const material = this.getFullscreenMaterial();
		material.uniforms.depthBuffer.value = depthTexture;
		material.depthPacking = depthPacking;

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

		const resolution = this.resolution;
		resolution.base.set(width, height);

		// Use the full resolution to calculate the depth/normal buffer texel size.
		this.getFullscreenMaterial().setTexelSize(1.0 / width, 1.0 / height);

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

			renderer.getContext().getExtension("OES_texture_float");

		}

	}

}
