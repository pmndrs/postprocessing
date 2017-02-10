import { ShaderMaterial, Vector2 } from "three";

import fragment from "./glsl/shader.frag";
import vertex from "./glsl/shader.vert";

/**
 * Subpixel Morphological Antialiasing.
 *
 * This material is used to render the final antialiasing.
 *
 * @class SMAABlendMaterial
 * @submodule materials
 * @extends ShaderMaterial
 * @constructor
 * @param {Vector2} [texelSize] - The absolute screen texel size.
 */

export class SMAABlendMaterial extends ShaderMaterial {

	constructor(texelSize = new Vector2()) {

		super({

			type: "SMAABlendMaterial",

			uniforms: {

				tDiffuse: { value: null },
				tWeights: { value: null },
				texelSize: { value: texelSize }

			},

			fragmentShader: fragment,
			vertexShader: vertex,

			depthWrite: false,
			depthTest: false

		});

	}

}
