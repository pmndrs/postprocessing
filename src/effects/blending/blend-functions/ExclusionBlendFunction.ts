import { BlendFunction } from "../BlendFunction.js";

import shader from "./shaders/exclusion.frag";

/**
 * Color exclusion.
 *
 * @category Blending
 */

export class ExclusionBlendFunction extends BlendFunction {

	/**
	 * Constructs a new exclusion blend function.
	 */

	constructor() {

		super("exclusion", shader);

	}

}
