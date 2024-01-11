import { BlendFunction } from "../BlendFunction.js";

import shader from "./shaders/darken.frag";

/**
 * Prioritizes darker colors. Supports HDR.
 *
 * @category Blending
 */

export class DarkenBlendFunction extends BlendFunction {

	/**
	 * Constructs a new darken blend function.
	 */

	constructor() {

		super("darken", shader, true);

	}

}
