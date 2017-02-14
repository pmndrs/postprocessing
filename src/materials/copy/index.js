import { ShaderMaterial, Uniform } from "three";

import fragment from "./glsl/shader.frag";
import vertex from "./glsl/shader.vert";

/**
 * A simple copy shader material.
 *
 * @class CopyMaterial
 * @submodule materials
 * @extends ShaderMaterial
 * @constructor
 */

export class CopyMaterial extends ShaderMaterial {

	constructor() {

		super({

			type: "CopyMaterial",

			uniforms: {

				tDiffuse: new Uniform(null),
				opacity: new Uniform(1.0)

			},

			fragmentShader: fragment,
			vertexShader: vertex,

			depthWrite: false,
			depthTest: false

		});

	}

}
