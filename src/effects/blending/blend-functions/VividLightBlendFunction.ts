import { BlendFunction } from "../BlendFunction.js";

import shader from "./shaders/vivid-light.frag";

/**
 * Vivid light.
 *
 * @group Blending
 */

export class VividLightBlendFunction extends BlendFunction {

	/**
	 * Constructs a new vivid light blend function.
	 */

	constructor() {

		super("vivid-light", shader);

	}

}
