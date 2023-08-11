import { Pass } from "./Pass.js";

/**
 * A pass that disables the stencil test.
 */

export class ClearMaskPass extends Pass {

	/**
	 * Constructs a new clear mask pass.
	 */

	constructor() {

		super("ClearMaskPass", null, null);
		this.needsSwap = false;

	}

	/**
	 * Disables the global stencil test.
	 *
	 * @param {WebGLRenderer} renderer - The renderer.
	 * @param {WebGLRenderTarget} inputBuffer - A frame buffer that contains the result of the previous pass.
	 * @param {WebGLRenderTarget} outputBuffer - A frame buffer that serves as the output render target unless this pass renders to screen.
	 * @param {Number} [deltaTime] - The time between the last frame and the current one in seconds.
	 * @param {Boolean} [stencilTest] - Indicates whether a stencil mask is active.
	 */

	render(renderer, inputBuffer, outputBuffer, deltaTime, stencilTest) {

		const stencil = renderer.state.buffers.stencil;
		stencil.setLocked(false);
		stencil.setTest(false);

	}

}
