import { Color } from "three";
import { Pass } from "./Pass.js";

const color = /* @__PURE__ */ new Color();

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
		 * @deprecated Use setClearFlags() instead.
		 */

		this.color = color;

		/**
		 * Indicates whether the depth buffer should be cleared.
		 *
		 * @type {Boolean}
		 * @deprecated Use setClearFlags() instead.
		 */

		this.depth = depth;

		/**
		 * Indicates whether the stencil buffer should be cleared.
		 *
		 * @type {Boolean}
		 * @deprecated Use setClearFlags() instead.
		 */

		this.stencil = stencil;

		/**
		 * An override clear color. Default is null.
		 *
		 * @type {Color}
		 */

		this.overrideClearColor = null;

		/**
		 * An override clear alpha. Default is -1.
		 *
		 * @type {Number}
		 */

		this.overrideClearAlpha = -1;

	}

	/**
	 * Sets the clear flags.
	 *
	 * @param {Boolean} color - Whether the color buffer should be cleared.
	 * @param {Boolean} depth - Whether the depth buffer should be cleared.
	 * @param {Boolean} stencil - Whether the stencil buffer should be cleared.
	 */

	setClearFlags(color, depth, stencil) {

		this.color = color;
		this.depth = depth;
		this.stencil = stencil;

	}

	/**
	 * Returns the override clear color. Default is null.
	 *
	 * @deprecated Use overrideClearColor instead.
	 * @return {Color} The clear color.
	 */

	getOverrideClearColor() {

		return this.overrideClearColor;

	}

	/**
	 * Sets the override clear color.
	 *
	 * @deprecated Use overrideClearColor instead.
	 * @param {Color} value - The clear color.
	 */

	setOverrideClearColor(value) {

		this.overrideClearColor = value;

	}

	/**
	 * Returns the override clear alpha. Default is -1.
	 *
	 * @deprecated Use overrideClearAlpha instead.
	 * @return {Number} The clear alpha.
	 */

	getOverrideClearAlpha() {

		return this.overrideClearAlpha;

	}

	/**
	 * Sets the override clear alpha.
	 *
	 * @deprecated Use overrideClearAlpha instead.
	 * @param {Number} value - The clear alpha.
	 */

	setOverrideClearAlpha(value) {

		this.overrideClearAlpha = value;

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
		const hasOverrideClearAlpha = (overrideClearAlpha >= 0);

		if(hasOverrideClearColor) {

			renderer.getClearColor(color);
			renderer.setClearColor(overrideClearColor, hasOverrideClearAlpha ? overrideClearAlpha : clearAlpha);

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
