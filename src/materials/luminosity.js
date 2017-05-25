import { ShaderMaterial, Uniform, Vector2 } from "three";

import fragment from "./glsl/luminosity/shader.frag";
import vertex from "./glsl/luminosity/shader.vert";

/**
 * A luminosity shader material.
 *
 * This shader produces a greyscale luminance map. It can also be configured to
 * output colours that are scaled with their respective luminance value.
 * Additionally, a range may be provided to mask out undesired texels.
 *
 * The alpha channel will remain unaffected in all cases.
 *
 * Luminance range reference:
 *  https://cycling74.com/2007/05/23/your-first-shader/#.Vty9FfkrL4Z
 */

export class LuminosityMaterial extends ShaderMaterial {

	/**
	 * Constructs a new luminosity material.
	 *
	 * @param {Boolean} [color=false] - Defines whether the shader should output colours scaled with their luminance value.
	 * @param {Vector2} [range] - If provided, the shader will mask out texels that aren't in the specified luminance range.
	 */

	constructor(color = false, range = null) {

		super({

			type: "LuminosityMaterial",

			uniforms: {

				tDiffuse: new Uniform(null),
				distinction: new Uniform(1.0),
				range: new Uniform((range !== null) ? range : new Vector2())

			},

			fragmentShader: fragment,
			vertexShader: vertex

		});

		if(color) { this.defines.COLOR = "1"; }
		if(range !== null) { this.defines.RANGE = "1"; }

	}

}
