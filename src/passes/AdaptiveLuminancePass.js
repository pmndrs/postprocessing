import { NearestFilter, WebGLRenderTarget } from "three";
import { AdaptiveLuminanceMaterial } from "../materials";
import { CopyPass } from "./CopyPass";
import { Pass } from "./Pass";

/**
 * A pass that renders an adaptive luminance map.
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

	constructor(luminanceBuffer, { minLuminance = 0.01, adaptationRate = 1.0 } = {}) {

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
			stencilBuffer: false,
			depthBuffer: false
		});

		this.renderTargetPrevious.texture.name = "Luminance.Previous";

		const material = this.getFullscreenMaterial();
		material.setLuminanceBuffer0(this.renderTargetPrevious.texture);
		material.setLuminanceBuffer1(luminanceBuffer);
		material.setMinLuminance(minLuminance);
		material.setAdaptationRate(adaptationRate);

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
	 * Returns the adaptive 1x1 luminance texture.
	 *
	 * @return {Texture} The texture.
	 */

	getTexture() {

		return this.renderTargetAdapted.texture;

	}

	/**
	 * Sets the 1x1 mipmap level.
	 *
	 * This level is used to identify the smallest mipmap of the main luminance texture which contains the downsampled
	 * average scene luminance.
	 *
	 * @type {Number}
	 * @deprecated Use getFullscreenMaterial().setMipLevel1x1() instead.
	 */

	set mipLevel1x1(value) {

		this.getFullscreenMaterial().setMipLevel1x1(value);

	}

	/**
	 * The luminance adaptation rate.
	 *
	 * @type {Number}
	 * @deprecated Use getFullscreenMaterial().getAdaptationRate() instead.
	 */

	get adaptationRate() {

		return this.getFullscreenMaterial().getAdaptationRate();

	}

	/**
	 * @type {Number}
	 * @deprecated Use getFullscreenMaterial().setAdaptationRate() instead.
	 */

	set adaptationRate(value) {

		this.getFullscreenMaterial().setAdaptationRate(value);

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
		this.getFullscreenMaterial().setDeltaTime(deltaTime);
		renderer.setRenderTarget(this.renderToScreen ? null : this.renderTargetAdapted);
		renderer.render(this.scene, this.camera);

		// Save the adapted luminance for the next frame.
		this.copyPass.render(renderer, this.renderTargetAdapted);

	}

}
