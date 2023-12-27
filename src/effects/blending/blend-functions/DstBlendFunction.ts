import { BlendFunction } from "../BlendFunction.js";

/**
 * Overwrites the new color with the base color and ignores opacity. Supports HDR.
 *
 * @group Blending
 */

export class DstBlendFunction extends BlendFunction {

	/**
	 * Constructs a new DST blend function.
	 */

	constructor() {

		super(null, true);

	}

}
