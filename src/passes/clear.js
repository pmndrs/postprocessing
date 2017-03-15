import { Color } from "three";
import { Pass } from "./pass.js";

/**
 * Used for saving the original clear color of the renderer.
 *
 * @property CLEAR_COLOR
 * @type Color
 * @private
 * @static
 */

const CLEAR_COLOR = new Color();

/**
 * A clear pass.
 *
 * You can prevent specific buffers from being cleared by setting either the
 * autoClearColor, autoClearStencil or autoClearDepth properties of the renderer
 * to false.
 *
 * @class ClearPass
 * @submodule passes
 * @extends Pass
 * @constructor
 * @param {Object} [options] - Additional options.
 * @param {Color} [options.clearColor=null] - An override clear color.
 * @param {Number} [options.clearAlpha=0.0] - An override clear alpha.
 */

export class ClearPass extends Pass {

	constructor(options = {}) {

		super(null, null, null);

		this.name = "ClearPass";

		/**
		 * Clear color.
		 *
		 * @property clearColor
		 * @type Color
		 * @default null
		 */

		this.clearColor = (options.clearColor !== undefined) ? options.clearColor : null;

		/**
		 * Clear alpha.
		 *
		 * @property clearAlpha
		 * @type Number
		 * @default 0.0
		 */

		this.clearAlpha = (options.clearAlpha !== undefined) ? options.clearAlpha : 0.0;

	}

	/**
	 * Clears the read buffer or the screen.
	 *
	 * @method render
	 * @param {WebGLRenderer} renderer - The renderer.
	 * @param {WebGLRenderTarget} readBuffer - The read buffer.
	 */

	render(renderer, readBuffer) {

		const clearColor = this.clearColor;

		let clearAlpha;

		if(clearColor !== null) {

			CLEAR_COLOR.copy(renderer.getClearColor());
			clearAlpha = renderer.getClearAlpha();
			renderer.setClearColor(clearColor, this.clearAlpha);

		}

		renderer.setRenderTarget(this.renderToScreen ? null : readBuffer);
		renderer.clear();

		if(clearColor !== null) {

			renderer.setClearColor(CLEAR_COLOR, clearAlpha);

		}

	}

}
