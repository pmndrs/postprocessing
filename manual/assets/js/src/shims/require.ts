/**
 * A require shim for external bundles.
 */

export function require(name: string) {

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
