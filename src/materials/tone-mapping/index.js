import THREE from "three";

import fragment from "./glsl/shader.frag";
import vertex from "./glsl/shader.vert";

/**
 * Full-screen tone-mapping shader material.
 * http://www.graphics.cornell.edu/~jaf/publications/sig02_paper.pdf
 *
 * @class ToneMappingMaterial
 * @submodule materials
 * @extends ShaderMaterial
 * @constructor
 */

export class ToneMappingMaterial extends THREE.ShaderMaterial {

	constructor() {

		super({

			type: "ToneMappingMaterial",

			uniforms: {

				tDiffuse: {value: null},
				luminanceMap: {value: null},
				averageLuminance: {value: 1.0},
				maxLuminance: {value: 16.0},
				middleGrey: {value: 0.6}

			},

			fragmentShader: fragment,
			vertexShader: vertex

		});

	}

}
