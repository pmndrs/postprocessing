import { BlendFunction } from "../BlendFunction.js";

import shader from "./shaders/hard-mix.frag";

/**
 * Hard mix.
 *
 * @category Blending
 */

export class HardMixBlendFunction extends BlendFunction {

	/**
	 * Constructs a new hard mix blend function.
	 */

	constructor() {

		super("hard-mix", shader);

	}

}
