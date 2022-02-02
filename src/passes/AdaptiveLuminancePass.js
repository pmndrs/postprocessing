import { HalfFloatType, NearestFilter, RGBAFormat, WebGLRenderTarget } from "three";
import { AdaptiveLuminanceMaterial } from "../materials";
import { CopyPass } from "./CopyPass";
import { Pass } from "./Pass";

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
		 * @type {CopyPass}
		 * @private
		 */

		this.copyPass = new CopyPass(this.renderTargetPrevious, false);

		this.setAdaptationRate(adaptationRate);

	}

	/**
	 * The adaptive luminance texture.
	 *
	 * @type {Texture}
	 * @deprecated Use getTexture() instead.
	 */

	get texture() {

		return this.getTexture();

	}

	/**
	 * The adaptive luminance texture.
	 *
	 * @return {Texture} The texture.
	 */

	getTexture() {

		return this.renderTarget.texture;

	}

	/**
	 * Sets the 1x1 mipmap level.
	 *
	 * This level is used to identify the smallest mipmap of the main luminance texture which contains the downsampled
	 * average scene luminance.
	 *
	 * @type {Number}
	 * @deprecated Use setMipLevel1x1() instead.
	 */

	set mipLevel1x1(value) {

		this.setMipLevel1x1(value);

	}

	/**
	 * Sets the 1x1 mipmap level.
	 *
	 * This level is used to identify the smallest mipmap of the main luminance texture which contains the downsampled
	 * average scene luminance.
	 *
	 * @param {Number} The level.
	 */

	setMipLevel1x1(value) {

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

		return this.getAdaptationRate();

	}

	/**
	 * @type {Number}
	 */

	set adaptationRate(value) {

		this.setAdaptationRate(value);

	}

	/**
	 * Returns the luminance adaptation rate.
	 *
	 * @return {Number} The adaptation rate.
	 */

	getAdaptationRate() {

		return this.getFullscreenMaterial().uniforms.tau.value;

	}

	/**
	 * Sets the luminance adaptation rate.
	 *
	 * @param {Number} value - The adaptation rate.
	 */

	setAdaptationRate(value) {

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
		this.copyPass.render(renderer, this.renderTargetAdapted);

	}

}
