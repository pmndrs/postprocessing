import { Pass } from "./pass";

/**
 * A mask pass.
 *
 * @class MaskPass
 * @submodule passes
 * @extends Pass
 * @constructor
 * @param {Scene} scene - The scene to render.
 * @param {Camera} camera - The camera to use to render the scene.
 */

export class MaskPass extends Pass {

	constructor(scene, camera) {

		super(scene, camera, null);

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
	 * @param {WebGLRenderer} renderer - The renderer to use.
	 * @param {WebGLRenderTarget} readBuffer - The read buffer containing the result of the previous pass.
	 * @param {WebGLRenderTarget} readBuffer - The write buffer.
	 */

	render(renderer, readBuffer, writeBuffer) {

		let ctx = renderer.context;
		let state = renderer.state;

		let writeValue = this.inverse ? 0 : 1;
		let clearValue = 1 - writeValue;

		// Don't update color or depth.
		state.setColorWrite(false);
		state.setDepthWrite(false);

		state.setStencilTest(true);
		state.setStencilOp(ctx.REPLACE, ctx.REPLACE, ctx.REPLACE);
		state.setStencilFunc(ctx.ALWAYS, writeValue, 0xffffffff);
		state.clearStencil(clearValue);

		// Draw the mask into both buffers.
		renderer.render(this.scene, this.camera, readBuffer, this.clear);
		renderer.render(this.scene, this.camera, writeBuffer, this.clear);

		// Re-enable update of color and depth.
		state.setColorWrite(true);
		state.setDepthWrite(true);

		// Only render where stencil is set to 1.
		state.setStencilFunc(ctx.EQUAL, 1, 0xffffffff); // draw if == 1
		state.setStencilOp(ctx.KEEP, ctx.KEEP, ctx.KEEP);

	}

}
