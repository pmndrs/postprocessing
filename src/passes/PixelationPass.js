import { PixelationMaterial } from "../materials";
import { Pass } from "./Pass.js";

/**
 * A pixelation pass.
 */

export class PixelationPass extends Pass {

	/**
	 * Constructs a new pixelation pass.
	 *
	 * @param {Number} [granularity=30.0] - The intensity of the effect.
	 */

	constructor(granularity = 30.0) {

		super("PixelationPass");

		this.setFullscreenMaterial(new PixelationMaterial());

		this.granularity = granularity;

	}

	/**
	 * The pixel granularity.
	 *
	 * @type {Number}
	 */

	get granularity() {

		return this.getFullscreenMaterial().granularity;

	}

	/**
	 * A higher value yields coarser visuals.
	 *
	 * @type {Number}
	 */

	set granularity(value = 30) {

		value = Math.floor(value);

		if(value % 2 > 0) {

			value += 1;

		}

		this.getFullscreenMaterial().granularity = value;

	}

	/**
	 * Renders the effect.
	 *
	 * @param {WebGLRenderer} renderer - The renderer.
	 * @param {WebGLRenderTarget} inputBuffer - A frame buffer that contains the result of the previous pass.
	 * @param {WebGLRenderTarget} outputBuffer - A frame buffer that serves as the output render target unless this pass renders to screen.
	 * @param {Number} [delta] - The time between the last frame and the current one in seconds.
	 * @param {Boolean} [stencilTest] - Indicates whether a stencil mask is active.
	 */

	render(renderer, inputBuffer, outputBuffer, delta, stencilTest) {

		this.getFullscreenMaterial().uniforms.tDiffuse.value = inputBuffer.texture;

		renderer.render(this.scene, this.camera, this.renderToScreen ? null : outputBuffer);

	}

	/**
	 * Updates the size of this pass.
	 *
	 * @param {Number} width - The width.
	 * @param {Number} height - The height.
	 */

	setSize(width, height) {

		this.getFullscreenMaterial().setResolution(width, height);

	}

}
