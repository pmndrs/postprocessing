import { BlendFunction } from "../BlendFunction.js";

/**
 * Overwrites the new color with the base color and ignores opacity. Supports HDR.
 *
 * @category Blending
 */

export class DstBlendFunction extends BlendFunction {

	/**
	 * Constructs a new DST blend function.
	 */

	constructor() {

		super("dst", null, true);

	}

}
