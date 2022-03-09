/**
 * A require shim for external bundles.
 */

export function require(name) {

	let module;

	switch(name) {

		case "three":
		case "three/examples/jsm/loaders/GLTFLoader.js":
			module = window.THREE;
			break;

		default:
			throw new Error(`Cannot require ${name}`);

	}

	return module;

}
