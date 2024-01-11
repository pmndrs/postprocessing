import { BlendFunction } from "../BlendFunction.js";

import shader from "./shaders/reflect.frag";

/**
 * Color reflection.
 *
 * @category Blending
 */

export class ReflectBlendFunction extends BlendFunction {

	/**
	 * Constructs a new reflect blend function.
	 */

	constructor() {

		super("reflect", shader);

	}

}
