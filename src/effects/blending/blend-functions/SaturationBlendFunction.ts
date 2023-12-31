import { BlendFunction } from "../BlendFunction.js";

import shader from "./shaders/saturation.frag";

/**
 * Converts the colors to HSL and blends based on saturation.
 *
 * @group Blending
 */

export class SaturationBlendFunction extends BlendFunction {

	/**
	 * Constructs a new saturation blend function.
	 */

	constructor() {

		super("saturation", shader);

	}

}
