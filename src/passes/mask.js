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
	 * Creates a stencil bit mask by rendering the scene into both the read and
	 * write buffer.
	 *
	 * @method render
	 * @param {WebGLRenderer} renderer - The renderer.
	 * @param {WebGLRenderTarget} readBuffer - The read buffer.
	 * @param {WebGLRenderTarget} writeBuffer - The write buffer.
	 */

	render(renderer, readBuffer, writeBuffer) {

		const context = renderer.context;
		const state = renderer.state;

		const scene = this.scene;
		const camera = this.camera;

		const writeValue = this.inverse ? 0 : 1;
		const clearValue = 1 - writeValue;

		// Don't update color or depth.
		state.buffers.color.setMask(false);
		state.buffers.depth.setMask(false);

		// Lock the buffers.
		state.buffers.color.setLocked(true);
		state.buffers.depth.setLocked(true);

		// Configure the stencil.
		state.buffers.stencil.setTest(true);
		state.buffers.stencil.setOp(context.REPLACE, context.REPLACE, context.REPLACE);
		state.buffers.stencil.setFunc(context.ALWAYS, writeValue, 0xffffffff);
		state.buffers.stencil.setClear(clearValue);

		// Draw the mask into both buffers.
		renderer.render(scene, camera, readBuffer, this.clear);
		renderer.render(scene, camera, writeBuffer, this.clear);

		// Unlock the buffers.
		state.buffers.color.setLocked(false);
		state.buffers.depth.setLocked(false);

		// Only render where the stencil is set to 1.
		state.buffers.stencil.setFunc(context.EQUAL, 1, 0xffffffff);
		state.buffers.stencil.setOp(context.KEEP, context.KEEP, context.KEEP);

	}

}
