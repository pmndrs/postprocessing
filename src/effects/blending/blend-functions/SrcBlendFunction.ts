import { BlendFunction } from "../BlendFunction.js";

import shader from "./shaders/src.frag";

/**
 * Overwrites the base color with the new one and ignores opacity. Supports HDR.
 *
 * @group Blending
 */

export class SrcBlendFunction extends BlendFunction {

	/**
	 * Constructs a new SRC blend function.
	 */

	constructor() {

		super("src", shader, true);

	}

}
