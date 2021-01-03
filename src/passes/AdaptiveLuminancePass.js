import {
	HalfFloatType,
	NearestFilter,
	RGBAFormat,
	WebGLRenderTarget
} from "three";

import { AdaptiveLuminanceMaterial } from "../materials";
import { Pass } from "./Pass";
import { SavePass } from "./SavePass";

/**
 * A pass that renders an adaptive luminance map.
 *
 * Requires support for `EXT_color_buffer_half_float`.
 */

export class AdaptiveLuminancePass extends Pass {

	/**
	 * Constructs a new adaptive luminance pass.
	 *
	 * @param {Texture} luminanceBuffer - A buffer that contains the current scene luminance.
	 * @param {Object} [options] - The options.
	 * @param {Number} [options.minLuminance=0.01] - The minimum luminance.
	 * @param {Number} [options.adaptationRate=1.0] - The luminance adaptation rate.
	 */

	constructor(luminanceBuffer, {
		minLuminance = 0.01,
		adaptationRate = 1.0
	} = {}) {

		super("AdaptiveLuminancePass");

		this.setFullscreenMaterial(new AdaptiveLuminanceMaterial());
		this.needsSwap = false;

		/**
		 * A 1x1 render target that stores a copy of the last adapted luminance.
		 *
		 * @type {WebGLRenderTarget}
		 * @private
		 */

		this.renderTargetPrevious = new WebGLRenderTarget(1, 1, {
			minFilter: NearestFilter,
			magFilter: NearestFilter,
			type: HalfFloatType,
			stencilBuffer: false,
			depthBuffer: false,
			format: RGBAFormat
		});

		this.renderTargetPrevious.texture.name = "Luminance.Previous";

		const uniforms = this.getFullscreenMaterial().uniforms;
		uniforms.luminanceBuffer0.value = this.renderTargetPrevious.texture;
		uniforms.luminanceBuffer1.value = luminanceBuffer;
		uniforms.minLuminance.value = minLuminance;

		/**
		 * A 1x1 render target that stores the adapted average luminance.
		 *
		 * @type {WebGLRenderTarget}
		 * @private
		 */

		this.renderTargetAdapted = this.renderTargetPrevious.clone();
		this.renderTargetAdapted.texture.name = "Luminance.Adapted";

		/**
		 * A save pass.
		 *
		 * @type {SavePass}
		 * @private
		 */

		this.savePass = new SavePass(this.renderTargetPrevious, false);

		this.adaptationRate = adaptationRate;

	}

	/**
	 * The adapted luminance texture.
	 *
	 * @type {Texture}
	 */

	get texture() {

		return this.renderTargetAdapted.texture;

	}

	/**
	 * Sets the 1x1 mipmap level.
	 *
	 * This level is used to identify the smallest mipmap of the main luminance
	 * texture which contains the downsampled average scene luminance.
	 *
	 * @type {Number}
	 */

	set mipLevel1x1(value) {

		const material = this.getFullscreenMaterial();
		material.defines.MIP_LEVEL_1X1 = value.toFixed(1);
		material.needsUpdate = true;

	}

	/**
	 * The luminance adaptation rate.
	 *
	 * @type {Number}
	 */

	get adaptationRate() {

		return this.getFullscreenMaterial().uniforms.tau.value;

	}

	/**
	 * @type {Number}
	 */

	set adaptationRate(value) {

		this.getFullscreenMaterial().uniforms.tau.value = value;

	}

	/**
	 * Renders the scene normals.
	 *
	 * @param {WebGLRenderer} renderer - The renderer.
	 * @param {WebGLRenderTarget} inputBuffer - A frame buffer that contains the result of the previous pass.
	 * @param {WebGLRenderTarget} outputBuffer - A frame buffer that serves as the output render target unless this pass renders to screen.
	 * @param {Number} [deltaTime] - The time between the last frame and the current one in seconds.
	 * @param {Boolean} [stencilTest] - Indicates whether a stencil mask is active.
	 */

	render(renderer, inputBuffer, outputBuffer, deltaTime, stencilTest) {

		// Use the frame delta time to chase after the current luminance.
		this.getFullscreenMaterial().uniforms.deltaTime.value = deltaTime;
		renderer.setRenderTarget(this.renderToScreen ? null : this.renderTargetAdapted);
		renderer.render(this.scene, this.camera);

		// Save the adapted luminance for the next frame.
		this.savePass.render(renderer, this.renderTargetAdapted);

	}

	/**
	 * Performs initialization tasks.
	 *
	 * @param {WebGLRenderer} renderer - The renderer.
	 * @param {Boolean} alpha - Whether the renderer uses the alpha channel or not.
	 * @param {Number} frameBufferType - The type of the main frame buffers.
	 */

	initialize(renderer, alpha, frameBufferType) {

		if(frameBufferType !== HalfFloatType) {

			const capabilities = renderer.capabilities;
			const context = renderer.getContext();

			if(capabilities.isWebGL2) {

				context.getExtension("EXT_color_buffer_float");

			} else {

				context.getExtension("EXT_color_buffer_half_float");

			}

		}

	}

}
