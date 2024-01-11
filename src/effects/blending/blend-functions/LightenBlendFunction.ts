import { BlendFunction } from "../BlendFunction.js";

import shader from "./shaders/lighten.frag";

/**
 * Prioritizes lighter colors. Supports HDR.
 *
 * @category Blending
 */

export class LightenBlendFunction extends BlendFunction {

	/**
	 * Constructs a new lighten blend function.
	 */

	constructor() {

		super("lighten", shader, true);

	}

}
