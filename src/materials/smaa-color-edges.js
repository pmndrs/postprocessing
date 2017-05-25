import { ShaderMaterial, Uniform, Vector2 } from "three";

import fragment from "./glsl/smaa-color-edges/shader.frag";
import vertex from "./glsl/smaa-color-edges/shader.vert";

/**
 * Subpixel Morphological Antialiasing.
 *
 * This material detects edges in a color texture.
 */

export class SMAAColorEdgesMaterial extends ShaderMaterial {

	/**
	 * Constructs a new SMAA color edges material.
	 *
	 * @param {Vector2} [texelSize] - The absolute screen texel size.
	 */

	constructor(texelSize = new Vector2()) {

		super({

			type: "SMAAColorEdgesMaterial",

			defines: {

				EDGE_THRESHOLD: "0.1"

			},

			uniforms: {

				tDiffuse: new Uniform(null),
				texelSize: new Uniform(texelSize)

			},

			fragmentShader: fragment,
			vertexShader: vertex,

			depthWrite: false,
			depthTest: false

		});

	}

}
