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
 */

ClearMaskPass.prototype.render = function(renderer) {

	renderer.context.disable(context.STENCIL_TEST);

};
