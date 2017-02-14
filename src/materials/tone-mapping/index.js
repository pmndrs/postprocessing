import { ShaderMaterial, Uniform } from "three";

import fragment from "./glsl/shader.frag";
import vertex from "./glsl/shader.vert";

/**
 * Full-screen tone-mapping shader material.
 *
 * Reference:
 *  http://www.graphics.cornell.edu/~jaf/publications/sig02_paper.pdf
 *
 * @class ToneMappingMaterial
 * @submodule materials
 * @extends ShaderMaterial
 * @constructor
 */

export class ToneMappingMaterial extends ShaderMaterial {

	constructor() {

		super({

			type: "ToneMappingMaterial",

			uniforms: {

				tDiffuse: new Uniform(null),
				luminanceMap: new Uniform(null),
				averageLuminance: new Uniform(1.0),
				maxLuminance: new Uniform(16.0),
				middleGrey: new Uniform(0.6)

			},

			fragmentShader: fragment,
			vertexShader: vertex,

			depthWrite: false,
			depthTest: false

		});

	}

}
