import { BlendFunction } from "../BlendFunction.js";

import shader from "./shaders/overlay.frag";

/**
 * Color overlay.
 *
 * @category Blending
 */

export class OverlayBlendFunction extends BlendFunction {

	/**
	 * Constructs a new overlay blend function.
	 */

	constructor() {

		super("overlay", shader);

	}

}
