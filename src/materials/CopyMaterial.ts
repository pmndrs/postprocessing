import { FullscreenMaterial } from "./FullscreenMaterial.js";

import fragmentShader from "./shaders/copy.frag";
import vertexShader from "./shaders/common.vert";

/**
 * A copy shader material.
 *
 * @group Materials
 */

export class CopyMaterial extends FullscreenMaterial {

	/**
	 * Constructs a new copy material.
	 */

	constructor() {

		super({
			name: "CopyMaterial",
			fragmentShader,
			vertexShader
		});

	}

}
