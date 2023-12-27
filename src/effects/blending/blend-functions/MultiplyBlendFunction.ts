import { BlendFunction } from "../BlendFunction.js";

import shader from "./shaders/multiply.frag";

/**
 * Color multiplication. Supports HDR.
 *
 * @group Blending
 */

export class MultiplyBlendFunction extends BlendFunction {

	/**
	 * Constructs a new multiply blend function.
	 */

	constructor() {

		super(shader, true);

	}

}
