/**
 * A require shim for external bundles.
 *
 * @param name - The module name.
 * @return The module.
 */

export function require(name: string): unknown {

	switch(name) {

		case "three":
		case "three/examples/jsm/loaders/GLTFLoader.js":
		case "tweakpane":
		case "spatial-controls":
			return window.VENDOR;

		default:
			throw new Error(`Cannot require ${name}`);

	}

}
