import { Color } from "three";
import { Pass } from "./Pass.js";

/**
 * Used for saving the original clear color of the renderer.
 *
 * @type {Color}
 * @private
 */

const color = new Color();

/**
 * A pass that clears the input buffer or the screen.
 */

export class ClearPass extends Pass {

	/**
	 * Constructs a new clear pass.
	 *
	 * @param {Object} [options] - Additional options.
	 * @param {Boolean} [options.color=true] - Determines whether the color buffer should be cleared.
	 * @param {Boolean} [options.depth=true] - Determines whether the depth buffer should be cleared.
	 * @param {Boolean} [options.stencil=true] - Determines whether the stencil buffer should be cleared.
	 * @param {Color} [options.clearColor=null] - An override clear color.
	 * @param {Number} [options.clearAlpha=0.0] - An override clear alpha.
	 */

	constructor(options = {}) {

		const settings = Object.assign({
			color: true,
			depth: true,
			stencil: true,
			clearColor: null,
			clearAlpha: 0.0
		}, options);

		super("ClearPass", null, null);

		this.needsSwap = false;

		/**
		 * Indicates whether the color buffer should be cleared.
		 *
		 * @type {Boolean}
		 */

		this.color = settings.color;

		/**
		 * Indicates whether the depth buffer should be cleared.
		 *
		 * @type {Boolean}
		 */

		this.depth = settings.depth;

		/**
		 * Indicates whether the stencil buffer should be cleared.
		 *
		 * @type {Boolean}
		 */

		this.stencil = settings.stencil;

		/**
		 * An override clear color.
		 *
		 * @type {Color}
		 */

		this.clearColor = settings.clearColor;

		/**
		 * An override clear alpha.
		 *
		 * @type {Number}
		 */

		this.clearAlpha = settings.clearAlpha;

	}

	/**
	 * Clears the input buffer or the screen.
	 *
	 * @param {WebGLRenderer} renderer - The renderer.
	 * @param {WebGLRenderTarget} inputBuffer - A frame buffer that contains the result of the previous pass.
	 * @param {WebGLRenderTarget} outputBuffer - A frame buffer that serves as the output render target unless this pass renders to screen.
	 * @param {Number} [deltaTime] - The time between the last frame and the current one in seconds.
	 * @param {Boolean} [stencilTest] - Indicates whether a stencil mask is active.
	 */

	render(renderer, inputBuffer, outputBuffer, deltaTime, stencilTest) {

		const clearColor = this.clearColor;

		let clearAlpha;

		if(clearColor !== null) {

			color.copy(renderer.getClearColor());
			clearAlpha = renderer.getClearAlpha();
			renderer.setClearColor(clearColor, this.clearAlpha);

		}

		renderer.setRenderTarget(this.renderToScreen ? null : inputBuffer);
		renderer.clear(this.color, this.depth, this.stencil);

		if(clearColor !== null) {

			renderer.setClearColor(color, clearAlpha);

		}

	}

}
