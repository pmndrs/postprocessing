import { Pass } from "./pass";

/**
 * A clear mask pass.
 *
 * @class ClearMaskPass
 * @constructor
 * @extends Pass
 */

export function ClearMaskPass() {

	Pass.call(this, null, null, null);

}

ClearMaskPass.prototype = Object.create(Pass.prototype);
ClearMaskPass.prototype.constructor = ClearMaskPass;

/**
 * This pass's render method disables the stencil test.
 *
 * @method render
 * @param {WebGLRenderer} renderer - The renderer to use.
 * @param {WebGLRenderTarget} writeBuffer - The write buffer.
 * @param {WebGLRenderTarget} readBuffer - The read buffer.
 * @param {Number} delta - The render delta time.
 * @param {Boolean} maskActive - This flag is supposed to mask this pass, but it isn't used here :/ hm.
 */

ClearMaskPass.prototype.render = function(renderer, writeBuffer, readBuffer, delta, maskActive) {

	renderer.context.disable(context.STENCIL_TEST);

};
