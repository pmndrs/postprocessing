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
 * Renders the scene.
 *
 * @method render
 * @param {WebGLRenderer} renderer - The renderer to use.
 * @param {WebGLRenderTarget} writeBuffer - The write buffer.
 * @param {WebGLRenderTarget} readBuffer - The read buffer.
 * @param {Number} delta - The render delta time.
 * @param {Boolean} maskActive - This flag is supposed to mask this pass, but it isn't used here :/ hm.
 */

MaskPass.prototype.render = function(renderer, writeBuffer, readBuffer, delta, maskActive) {

	var context = renderer.context;
	var writeValue, clearValue;

	// Don't update color or depth.
	context.colorMask(false, false, false, false);
	context.depthMask(false);

	if(this.inverse) {

		writeValue = 0;
		clearValue = 1;

	} else {

		writeValue = 1;
		clearValue = 0;

	}

	context.enable(context.STENCIL_TEST);
	context.stencilOp(context.REPLACE, context.REPLACE, context.REPLACE);
	context.stencilFunc(context.ALWAYS, writeValue, 0xffffffff);
	context.clearStencil(clearValue);

	// Draw into the stencil buffer.
	renderer.render(this.scene, this.camera, readBuffer, this.clear);
	renderer.render(this.scene, this.camera, writeBuffer, this.clear);

	// Re-enable update of color and depth.
	context.colorMask(true, true, true, true);
	context.depthMask(true);

	// Only render where stencil is set to 1.
	context.stencilFunc(context.EQUAL, 1, 0xffffffff);
	context.stencilOp(context.KEEP, context.KEEP, context.KEEP);

};
