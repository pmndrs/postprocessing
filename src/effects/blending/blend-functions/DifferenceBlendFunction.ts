import { BlendFunction } from "../BlendFunction.js";

import shader from "./shaders/difference.frag";

/**
 * Color difference. Supports HDR.
 *
 * @group Blending
 */

export class DifferenceBlendFunction extends BlendFunction {

	/**
	 * Constructs a new difference blend function.
	 */

	constructor() {

		super("difference", shader, true);

	}

}
