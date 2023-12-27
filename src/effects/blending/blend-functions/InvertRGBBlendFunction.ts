import { BlendFunction } from "../BlendFunction.js";

import shader from "./shaders/invert-rgb.frag";

/**
 * Multiplies the new color with the inverted base color.
 *
 * @group Blending
 */

export class InvertRGBBlendFunction extends BlendFunction {

	/**
	 * Constructs a new invert RGB blend function.
	 */

	constructor() {

		super(shader);

	}

}
