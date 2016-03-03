import { Pass } from "./pass";

/**
 * A mask pass.
 *
 * @class MaskPass
 * @constructor
 * @extends Pass
 * @param {Scene} scene - The scene to render.
 * @param {Camera} camera - The camera to use to render the scene.
 */

export function MaskPass(scene, camera) {

	Pass.call(this, scene, camera, null);

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

MaskPass.prototype = Object.create(Pass.prototype);
MaskPass.prototype.constructor = MaskPass;

/**
 * Renders the scene as a mask by only setting the stencil bits.
 * The buffers will both be cleared first.
 *
 * @method render
 * @param {WebGLRenderer} renderer - The renderer to use.
 * @param {WebGLRenderTarget} readBuffer - The read buffer containing the result of the previous pass.
 * @param {WebGLRenderTarget} readBuffer - The write buffer.
 */

MaskPass.prototype.render = function(renderer, readBuffer, writeBuffer) {

	let ctx = renderer.context;
	let writeValue = this.inverse ? 0 : 1;
	let clearValue = 1 - writeValue;

	// Don't update color or depth.
	ctx.colorMask(false, false, false, false);
	ctx.depthMask(false);

	ctx.enable(ctx.STENCIL_TEST);
	ctx.stencilOp(ctx.REPLACE, ctx.REPLACE, ctx.REPLACE);
	ctx.stencilFunc(ctx.ALWAYS, writeValue, 0xffffffff);
	ctx.clearStencil(clearValue);

	// Draw the mask into both buffers.
	renderer.render(this.scene, this.camera, readBuffer, this.clear);
	renderer.render(this.scene, this.camera, writeBuffer, this.clear);

	// Re-enable update of color and depth.
	ctx.colorMask(true, true, true, true);
	ctx.depthMask(true);

	// Only render where stencil is set to 1.
	ctx.stencilFunc(ctx.EQUAL, 1, 0xffffffff);
	ctx.stencilOp(ctx.KEEP, ctx.KEEP, ctx.KEEP);

};
