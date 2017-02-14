import { ShaderMaterial, Uniform } from "three";

import fragment from "./glsl/shader.frag";
import vertex from "./glsl/shader.vert";

/**
 * A material for combining two textures.
 *
 * This material supports the two blend modes Add and Screen.
 *
 * In Screen mode, the two textures are effectively projected on a white screen
 * simultaneously. In Add mode, the textures are simply added together which
 * often produces washed out results.
 *
 * @class CombineMaterial
 * @submodule materials
 * @extends ShaderMaterial
 * @constructor
 * @param {Boolean} [screenMode=false] - Whether the screen blend mode should be used.
 */

export class CombineMaterial extends ShaderMaterial {

	constructor(screenMode = false) {

		super({

			type: "CombineMaterial",

			uniforms: {

				texture1: new Uniform(null),
				texture2: new Uniform(null),

				opacity1: new Uniform(1.0),
				opacity2: new Uniform(1.0)

			},

			fragmentShader: fragment,
			vertexShader: vertex,

			depthWrite: false,
			depthTest: false

		});

		if(screenMode) { this.defines.SCREEN_MODE = "1"; }

	}

}
