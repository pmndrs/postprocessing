import { Pass } from "./pass.js";

/**
 * A mask pass.
 *
 * @class MaskPass
 * @submodule passes
 * @extends Pass
 * @constructor
 * @param {Scene} scene - The scene to render.
 * @param {Camera} camera - The camera to use.
 */

export class MaskPass extends Pass {

	constructor(scene, camera) {

		super(scene, camera, null);

		this.name = "MaskPass";

		/**
		 * Inverse flag.
		 *
		 * @property inverse
		 * @type Boolean
		 * @default false
		 */

		this.inverse = false;

		/**
		 * Clear flag.
		 *
		 * @property clear
		 * @type Boolean
		 * @default true
		 */

		this.clear = true;

	}

	/**
	 * Renders the scene as a mask by only setting the stencil bits.
	 * The buffers will both be cleared first.
	 *
	 * @method render
	 * @param {WebGLRenderer} renderer - The renderer.
	 * @param {WebGLRenderTarget} readBuffer - The read buffer.
	 * @param {WebGLRenderTarget} writeBuffer - The write buffer.
	 */

	render(renderer, readBuffer, writeBuffer) {

		const context = renderer.context;
		const state = renderer.state;

		const writeValue = this.inverse ? 0 : 1;
		const clearValue = 1 - writeValue;

		const scene = this.scene;
		const camera = this.camera;
		const clear = this.clear;

		// Don't update color or depth.
		state.setColorWrite(false);
		state.setDepthWrite(false);

		state.setStencilTest(true);
		state.setStencilOp(context.REPLACE, context.REPLACE, context.REPLACE);
		state.setStencilFunc(context.ALWAYS, writeValue, 0xffffffff);
		state.clearStencil(clearValue);

		// Draw the mask into both buffers.
		renderer.render(scene, camera, readBuffer, clear);
		renderer.render(scene, camera, writeBuffer, clear);

		// Re-enable update of color and depth.
		state.setColorWrite(true);
		state.setDepthWrite(true);

		// Only render where stencil is set to 1.
		state.setStencilFunc(context.EQUAL, 1, 0xffffffff);
		state.setStencilOp(context.KEEP, context.KEEP, context.KEEP);

	}

}
