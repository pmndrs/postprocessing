import { Pass } from "../core/Pass.js";

/**
 * A pass that executes a given function.
 *
 * @category Passes
 */

export class LambdaPass extends Pass {

	/**
	 * The function to execute.
	 */

	f: () => void;

	/**
	 * Constructs a new lambda pass.
	 *
	 * @param f - A function.
	 */

	constructor(f: () => void) {

		super("LambdaPass");
		this.f = f;

	}

	override render(): void {

		this.f();

	}

}
