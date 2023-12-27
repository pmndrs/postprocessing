import { BlendFunction } from "../BlendFunction.js";

import shader from "./shaders/add.frag";

/**
 * Additive blending. Supports HDR.
 *
 * @group Blending
 */

export class AddBlendFunction extends BlendFunction {

	/**
	 * Constructs a new add blend function.
	 */

	constructor() {

		super(shader, true);

	}

}
