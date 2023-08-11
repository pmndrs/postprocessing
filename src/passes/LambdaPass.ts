import { Pass } from "../core/Pass.js";

/**
 * A pass that executes a given function.
 *
 * @group Passes
 */

export class LambdaPass extends Pass {

	/**
	 * The function to execute.
	 */

	f: CallableFunction;

	/**
	 * Constructs a new lambda pass.
	 *
	 * @param f - A function.
	 */

	constructor(f: CallableFunction) {

		super("LambdaPass");
		this.f = f;

	}

	override render() {

		this.f();

	}

}
