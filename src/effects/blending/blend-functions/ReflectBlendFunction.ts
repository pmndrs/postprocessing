import { BlendFunction } from "../BlendFunction.js";

import shader from "./shaders/reflect.frag";

/**
 * Color reflection.
 *
 * @group Blending
 */

export class ReflectBlendFunction extends BlendFunction {

	/**
	 * Constructs a new reflect blend function.
	 */

	constructor() {

		super(shader);

	}

}
