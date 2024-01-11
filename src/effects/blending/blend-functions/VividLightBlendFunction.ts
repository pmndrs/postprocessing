import { BlendFunction } from "../BlendFunction.js";

import shader from "./shaders/vivid-light.frag";

/**
 * Vivid light.
 *
 * @category Blending
 */

export class VividLightBlendFunction extends BlendFunction {

	/**
	 * Constructs a new vivid light blend function.
	 */

	constructor() {

		super("vivid-light", shader);

	}

}
