import THREE from "three";

import fragment from "./glsl/shader.frag";
import vertex from "./glsl/shader.vert";

/**
 * A material for combining two textures.
 *
 * @class CombineMaterial
 * @submodule materials
 * @extends ShaderMaterial
 * @constructor
 * @param {Boolean} [invertTexture1=false] - Invert the first texture's rgb values.
 * @param {Boolean} [invertTexture2=false] - Invert the second texture's rgb values.
 */

export class CombineMaterial extends THREE.ShaderMaterial {

	constructor(invertTexture1, invertTexture2) {

		super({

			type: "CombineMaterial",

			uniforms: {

				texture1: {type: "t", value: null},
				texture2: {type: "t", value: null},

				opacity1: {type: "f", value: 1.0},
				opacity2: {type: "f", value: 1.0}

			},

			fragmentShader: fragment,
			vertexShader: vertex

		});

		if(invertTexture1) { this.defines.INVERT_TEX1 = "1"; }
		if(invertTexture2) { this.defines.INVERT_TEX2 = "1"; }

	}

}
