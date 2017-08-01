import { ShaderMaterial, Uniform, Vector2 } from "three";

import fragment from "./glsl/smaa-blend/shader.frag";
import vertex from "./glsl/smaa-blend/shader.vert";

/**
 * Subpixel Morphological Antialiasing.
 *
 * This material is used to render the final antialiasing.
 */

export class SMAABlendMaterial extends ShaderMaterial {

	/**
	 * Constructs a new SMAA blend material.
	 *
	 * @param {Vector2} [texelSize] - The absolute screen texel size.
	 */

	constructor(texelSize = new Vector2()) {

		super({

			type: "SMAABlendMaterial",

			uniforms: {

				tDiffuse: new Uniform(null),
				tWeights: new Uniform(null),
				texelSize: new Uniform(texelSize)

			},

			fragmentShader: fragment,
			vertexShader: vertex,

			depthWrite: false,
			depthTest: false

		});

	}

}
