import THREE from "three";

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

export class CopyMaterial extends THREE.ShaderMaterial {

	constructor() {

		super({

			type: "CopyMaterial",

			uniforms: {

				tDiffuse: { value: null },
				opacity: { value: 1.0 }

			},

			fragmentShader: fragment,
			vertexShader: vertex

		});

	}

}
