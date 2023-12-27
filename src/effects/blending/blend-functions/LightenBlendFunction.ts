import { BlendFunction } from "../BlendFunction.js";

import shader from "./shaders/lighten.frag";

/**
 * Prioritizes lighter colors. Supports HDR.
 *
 * @group Blending
 */

export class LightenBlendFunction extends BlendFunction {

	/**
	 * Constructs a new lighten blend function.
	 */

	constructor() {

		super(shader, true);

	}

}
