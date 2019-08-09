import { ClearPass } from "./ClearPass.js";
import { Pass } from "./Pass.js";

/**
 * A mask pass.
 *
 * This pass requires that the input and output buffers have a stencil buffer.
 * You can enable the stencil buffer via the {@link EffectComposer} constructor.
 */

export class MaskPass extends Pass {

	/**
	 * Constructs a new mask pass.
	 *
	 * @param {Scene} scene - The scene to render.
	 * @param {Camera} camera - The camera to use.
	 */

	constructor(scene, camera) {

		super("MaskPass", scene, camera);

		this.needsSwap = false;

		/**
		 * A clear pass.
		 *
		 * @type {ClearPass}
		 * @private
		 */

		this.clearPass = new ClearPass(false, false, true);

		/**
		 * Inverse flag.
		 *
		 * @type {Boolean}
		 */

		this.inverse = false;

	}

	/**
	 * Indicates whether this pass should clear the stencil buffer.
	 *
	 * @type {Boolean}
	 */

	get clear() {

		return this.clearPass.enabled;

	}

	/**
	 * Enables or disables auto clear.
	 *
	 * @type {Boolean}
	 */

	set clear(value) {

		this.clearPass.enabled = value;

	}

	/**
	 * Renders the effect.
	 *
	 * @param {WebGLRenderer} renderer - The renderer.
	 * @param {WebGLRenderTarget} inputBuffer - A frame buffer that contains the result of the previous pass.
	 * @param {WebGLRenderTarget} outputBuffer - A frame buffer that serves as the output render target unless this pass renders to screen.
	 * @param {Number} [deltaTime] - The time between the last frame and the current one in seconds.
	 * @param {Boolean} [stencilTest] - Indicates whether a stencil mask is active.
	 */

	render(renderer, inputBuffer, outputBuffer, deltaTime, stencilTest) {

		const context = renderer.getContext();
		const buffers = renderer.state.buffers;

		const scene = this.scene;
		const camera = this.camera;
		const clearPass = this.clearPass;

		const writeValue = this.inverse ? 0 : 1;
		const clearValue = 1 - writeValue;

		// Don't update color or depth.
		buffers.color.setMask(false);
		buffers.depth.setMask(false);

		// Lock the buffers.
		buffers.color.setLocked(true);
		buffers.depth.setLocked(true);

		// Configure the stencil.
		buffers.stencil.setTest(true);
		buffers.stencil.setOp(context.REPLACE, context.REPLACE, context.REPLACE);
		buffers.stencil.setFunc(context.ALWAYS, writeValue, 0xffffffff);
		buffers.stencil.setClear(clearValue);
		buffers.stencil.setLocked(true);

		// Clear the stencil.
		if(this.clear) {

			if(this.renderToScreen) {

				clearPass.render(renderer, null);

			} else {

				clearPass.render(renderer, inputBuffer);
				clearPass.render(renderer, outputBuffer);

			}

		}

		// Draw the mask.
		if(this.renderToScreen) {

			renderer.setRenderTarget(null);
			renderer.render(scene, camera);

		} else {

			renderer.setRenderTarget(inputBuffer);
			renderer.render(scene, camera);
			renderer.setRenderTarget(outputBuffer);
			renderer.render(scene, camera);

		}

		// Unlock the buffers.
		buffers.color.setLocked(false);
		buffers.depth.setLocked(false);

		// Only render where the stencil is set to 1.
		buffers.stencil.setLocked(false);
		buffers.stencil.setFunc(context.EQUAL, 1, 0xffffffff);
		buffers.stencil.setOp(context.KEEP, context.KEEP, context.KEEP);
		buffers.stencil.setLocked(true);

	}

}
