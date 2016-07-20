import THREE from "three";

import fragment from "./glsl/shader.frag";
import vertex from "./glsl/shader.vert";

/**
 * A luminance shader material.
 *
 * This shader produces a greyscale luminance map. It can also be configured to
 * output colors that are scaled with their respective luminance value.
 * Additionally, a range may be provided to mask out undesired texels.
 *
 * The alpha channel will remain unaffected in all cases.
 *
 * Luminance range reference:
 *  https://cycling74.com/2007/05/23/your-first-shader/#.Vty9FfkrL4Z
 *
 * @class LuminosityMaterial
 * @submodule materials
 * @extends ShaderMaterial
 * @constructor
 * @params {Boolean} [color=false] - Defines whether the shader should output colours scaled with their luminance value.
 * @params {Vector2} [range] - If provided, the shader will mask out texels that aren't in the specified range.
 */

export class LuminosityMaterial extends THREE.ShaderMaterial {

	constructor(color, range) {

		super({

			type: "LuminosityMaterial",

			uniforms: {

				tDiffuse: { value: null },
				distinction: { value: 1.0 },
				range: { value: (range !== undefined) ? range : new THREE.Vector2() }

			},

			fragmentShader: fragment,
			vertexShader: vertex

		});

		if(color !== undefined) { this.defines.COLOR = "1"; }
		if(range !== undefined) { this.defines.RANGE = "1"; }

	}

}
