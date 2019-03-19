import { Color } from "three";
import { Pass } from "./Pass.js";

/**
 * Stores the original clear color of the renderer.
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
	 * @param {Boolean} [color=true] - Determines whether the color buffer should be cleared.
	 * @param {Boolean} [depth=true] - Determines whether the depth buffer should be cleared.
	 * @param {Boolean} [stencil=false] - Determines whether the stencil buffer should be cleared.
	 */

	constructor(color = true, depth = true, stencil = false) {

		super("ClearPass", null, null);

		this.needsSwap = false;

		/**
		 * Indicates whether the color buffer should be cleared.
		 *
		 * @type {Boolean}
		 */

		this.color = color;

		/**
		 * Indicates whether the depth buffer should be cleared.
		 *
		 * @type {Boolean}
		 */

		this.depth = depth;

		/**
		 * Indicates whether the stencil buffer should be cleared.
		 *
		 * @type {Boolean}
		 */

		this.stencil = stencil;

		/**
		 * An override clear color.
		 *
		 * The default value is null.
		 *
		 * @type {Color}
		 */

		this.overrideClearColor = null;

		/**
		 * An override clear alpha.
		 *
		 * The default value is -1.
		 *
		 * @type {Number}
		 */

		this.overrideClearAlpha = -1.0;

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

		const overrideClearColor = this.overrideClearColor;
		const overrideClearAlpha = this.overrideClearAlpha;
		const clearAlpha = renderer.getClearAlpha();

		const hasOverrideClearColor = (overrideClearColor !== null);
		const hasOverrideClearAlpha = (overrideClearAlpha >= 0.0);

		if(hasOverrideClearColor) {

			color.copy(renderer.getClearColor());
			renderer.setClearColor(overrideClearColor, hasOverrideClearAlpha ?
				overrideClearAlpha : clearAlpha);

		} else if(hasOverrideClearAlpha) {

			renderer.setClearAlpha(overrideClearAlpha);

		}

		renderer.setRenderTarget(this.renderToScreen ? null : inputBuffer);
		renderer.clear(this.color, this.depth, this.stencil);

		if(hasOverrideClearColor) {

			renderer.setClearColor(color, clearAlpha);

		} else if(hasOverrideClearAlpha) {

			renderer.setClearAlpha(clearAlpha);

		}

	}

}
