import { BlendFunction } from "../BlendFunction.js";

import shader from "./shaders/color.frag";

/**
 * Converts the colors to HSL and blends based on color.
 *
 * @group Blending
 */

export class ColorBlendFunction extends BlendFunction {

	/**
	 * Constructs a new color blend function.
	 */

	constructor() {

		super(shader);

	}

}
