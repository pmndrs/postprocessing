import { BlendFunction } from "../BlendFunction.js";

import shader from "./shaders/hard-light.frag";

/**
 * Hard light.
 *
 * @group Blending
 */

export class HardLightBlendFunction extends BlendFunction {

	/**
	 * Constructs a new hard light blend function.
	 */

	constructor() {

		super(shader);

	}

}
