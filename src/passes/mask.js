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
 * Renders the scene as a mask into the stencil buffer.
 *
 * @method render
 * @param {WebGLRenderer} renderer - The renderer to use.
 * @param {WebGLRenderTarget} buffer - The read/write buffer.
 */

MaskPass.prototype.render = function(renderer, buffer) {

	let ctx = renderer.context;
	let writeValue, clearValue;

	// Don't update color or depth.
	ctx.colorMask(false, false, false, false);
	ctx.depthMask(false);

	if(this.inverse) {

		writeValue = 0;
		clearValue = 1;

	} else {

		writeValue = 1;
		clearValue = 0;

	}

	ctx.enable(ctx.STENCIL_TEST);
	ctx.stencilOp(ctx.REPLACE, ctx.REPLACE, ctx.REPLACE);
	ctx.stencilFunc(ctx.ALWAYS, writeValue, 0xffffffff);
	ctx.clearStencil(clearValue);

	// Draw into the stencil buffer.
	renderer.render(this.scene, this.camera, buffer, this.clear);

	// Re-enable update of color and depth.
	ctx.colorMask(true, true, true, true);
	ctx.depthMask(true);

	// Only render where stencil is set to 1.
	ctx.stencilFunc(ctx.EQUAL, 1, 0xffffffff);
	ctx.stencilOp(ctx.KEEP, ctx.KEEP, ctx.KEEP);

};
