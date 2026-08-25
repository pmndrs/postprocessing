import { Vector2 } from "three";

/**
 * A mock renderer.
 */

export class WebGLRendererMock {

	autoClear = true;
	domElement = {};

	info = {
		autoReset: true,
		reset: () => undefined
	};

	getPixelRatio() {

		return 1;

	}

	getSize(size: Vector2) {

		return size.set(128, 64);

	}

}
