import { Pass } from "./Pass.js";

/**
 * A pass that executes a given function.
 */

export class LambdaPass extends Pass {

	/**
	 * Constructs a new lambda pass.
	 *
	 * @param {Function} f - A function.
	 */

	constructor(f) {

		super("LambdaPass", null, null);

		this.needsSwap = false;

		/**
		 * A function.
		 *
		 * @type {Function}
		 * @private
		 */

		this.f = f;

	}

	/**
	 * Executes the function.
	 *
	 * @param {WebGLRenderer} renderer - The renderer.
	 * @param {WebGLRenderTarget} inputBuffer - A frame buffer that contains the result of the previous pass.
	 * @param {WebGLRenderTarget} outputBuffer - A frame buffer that serves as the output render target unless this pass renders to screen.
	 * @param {Number} [deltaTime] - The time between the last frame and the current one in seconds.
	 * @param {Boolean} [stencilTest] - Indicates whether a stencil mask is active.
	 */

	render(renderer, inputBuffer, outputBuffer, deltaTime, stencilTest) {

		this.f();

	}

}
