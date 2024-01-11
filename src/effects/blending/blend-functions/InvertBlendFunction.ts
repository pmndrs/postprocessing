import { BlendFunction } from "../BlendFunction.js";

import shader from "./shaders/invert.frag";

/**
 * Overwrites the base color with the inverted new color.
 *
 * @category Blending
 */

export class InvertBlendFunction extends BlendFunction {

	/**
	 * Constructs a new invert blend function.
	 */

	constructor() {

		super("invert", shader);

	}

}
