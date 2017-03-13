import { Pass } from "./pass.js";

/**
 * A pass that disables the stencil mask.
 *
 * @class ClearMaskPass
 * @submodule passes
 * @extends Pass
 * @constructor
 */

export class ClearMaskPass extends Pass {

	constructor() {

		super(null, null, null);

		this.name = "ClearMaskPass";

	}

	/**
	 * Disables the stencil test.
	 *
	 * @method render
	 * @param {WebGLRenderer} renderer - The renderer.
	 */

	render(renderer) {

		renderer.state.buffers.stencil.setTest(false);

	}

}
