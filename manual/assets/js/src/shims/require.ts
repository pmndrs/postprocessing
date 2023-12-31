/**
 * A require shim for external bundles.
 *
 * @param name - The module name.
 * @return The module.
 */

export function require(name: string): unknown {

	switch(name) {

		case "three":
		case "three/addons/loaders/GLTFLoader.js":
		case "three/addons/loaders/LUT3dlLoader.js":
		case "three/addons/loaders/LUTCubeLoader.js":
		case "three/addons/misc/Timer.js":
		case "tweakpane":
		case "@tweakpane/plugin-essentials":
		case "spatial-controls":
			return window.VENDOR;

		default:
			throw new Error(`Cannot require ${name}`);

	}

}
