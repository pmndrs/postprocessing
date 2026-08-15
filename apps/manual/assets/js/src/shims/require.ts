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
		case "three/examples/jsm/loaders/LUT3dlLoader.js":
		case "three/examples/jsm/loaders/LUTCubeLoader.js":
		case "three/examples/jsm/misc/Timer.js":
		case "tweakpane":
		case "@tweakpane/plugin-essentials":
		case "spatial-controls":
			return window.VENDOR;

		default:
			throw new Error(`Cannot require ${name}`);

	}

}
