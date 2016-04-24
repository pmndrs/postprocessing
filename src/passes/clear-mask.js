import { Pass } from "./pass";

/**
 * A clear mask pass.
 *
 * @class ClearMaskPass
 * @submodule passes
 * @extends Pass
 * @constructor
 */

export class ClearMaskPass extends Pass {

	constructor() {

		super(null, null, null);

	}

	/**
	 * This pass disables the stencil test.
	 *
	 * @method render
	 * @param {WebGLRenderer} renderer - The renderer to use.
	 */

	render(renderer) {

		renderer.context.disable(renderer.context.STENCIL_TEST);

	}

}
