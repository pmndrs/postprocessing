import { Pass } from "./Pass";

/**
 * A pass that executes a given function.
 */

export class LambdaPass extends Pass {

	/**
	 * Constructs a new lambda pass.
	 *
	 * @param {Function} f - A function.
	 */

	constructor(f) {

		super("LambdaPass", null, null);

		this.needsSwap = false;

		/**
		 * A function.
		 *
		 * @type {Function}
		 * @private
		 */

		this.f = f;

	}

	render(renderer, inputBuffer, outputBuffer, deltaTime, stencilTest) {

		this.f();

	}

}
