import { BlendFunction } from "../BlendFunction.js";

import shader from "./shaders/screen.frag";

/**
 * Screen blending. The two colors are effectively projected on a white screen simultaneously.
 *
 * @group Blending
 */

export class ScreenBlendFunction extends BlendFunction {

	/**
	 * Constructs a new screen blend function.
	 */

	constructor() {

		super("screen", shader);

	}

}
