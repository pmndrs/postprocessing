import { ShaderMaterial, Uniform, Vector2, Vector3 } from "three";

import fragment from "./glsl/luminosity/shader.frag";
import vertex from "./glsl/luminosity/shader.vert";

/**
 * A luminosity shader material.
 *
 * This shader produces a greyscale luminance map that describes the absolute
 * amount of light emitted by a scene. It can also be configured to output
 * colours that are scaled with their respective luminance value. Additionally,
 * a range may be provided to mask out undesired texels.
 *
 * The alpha channel will remain unaffected in all cases.
 *
 * On luminance coefficients:
 *  http://www.poynton.com/notes/colour_and_gamma/ColorFAQ.html#RTFToC9
 *
 * Coefficients for different colour spaces:
 *  https://hsto.org/getpro/habr/post_images/2ab/69d/084/2ab69d084f9a597e032624bcd74d57a7.png
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
				range: new Uniform((range !== null) ? range : new Vector2()),
				luminanceCoefficients: new Uniform(new Vector3(0.2126, 0.7152, 0.0722))

			},

			fragmentShader: fragment,
			vertexShader: vertex

		});

		if(color) { this.defines.COLOR = "1"; }
		if(range !== null) { this.defines.RANGE = "1"; }

	}

}
