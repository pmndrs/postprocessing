import { BlendFunction } from "../BlendFunction.js";

import shader from "./shaders/overlay.frag";

/**
 * Color overlay.
 *
 * @group Blending
 */

export class OverlayBlendFunction extends BlendFunction {

	/**
	 * Constructs a new overlay blend function.
	 */

	constructor() {

		super("overlay", shader);

	}

}
