import THREE from "three";

import fragment from "./glsl/shader.frag";
import vertex from "./glsl/shader.vert";

/**
 * Full-screen tone-mapping shader material.
 * http://www.graphics.cornell.edu/~jaf/publications/sig02_paper.pdf
 *
 * @class ToneMappingMaterial
 * @constructor
 * @extends ShaderMaterial
 */

export class ToneMappingMaterial extends THREE.ShaderMaterial {

	constructor() {

		super({

			uniforms: {

				tDiffuse: {type: "t", value: null},
				luminanceMap: {type: "t", value: null},
				averageLuminance: {type: "f", value: 1.0},
				maxLuminance: {type: "f", value: 16.0},
				middleGrey: {type: "f", value: 0.6}

			},

			fragmentShader: fragment,
			vertexShader: vertex

		});

	}

}
