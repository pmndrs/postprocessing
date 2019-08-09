import { ShaderMaterial, Uniform, Vector2 } from "three";

import fragmentShader from "./glsl/luminance/shader.frag";
import vertexShader from "./glsl/common/shader.vert";

/**
 * A luminance shader material.
 *
 * This shader produces a greyscale luminance map that describes the absolute
 * amount of light emitted by a scene. It can also be configured to output
 * colours that are scaled with their respective luminance value. Additionally,
 * a range may be provided to mask out undesired texels.
 *
 * The alpha channel always contains the luminance value.
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

export class LuminanceMaterial extends ShaderMaterial {

	/**
	 * Constructs a new luminance material.
	 *
	 * @param {Boolean} [colorOutput=false] - Defines whether the shader should output colors scaled with their luminance value.
	 * @param {Vector2} [luminanceRange] - If provided, the shader will mask out texels that aren't in the specified luminance range.
	 */

	constructor(colorOutput = false, luminanceRange = null) {

		const maskLuminance = (luminanceRange !== null);

		super({

			type: "LuminanceMaterial",

			uniforms: {

				inputBuffer: new Uniform(null),
				threshold: new Uniform(0.0),
				smoothing: new Uniform(1.0),
				range: new Uniform(maskLuminance ? luminanceRange : new Vector2())

			},

			fragmentShader,
			vertexShader,

			depthWrite: false,
			depthTest: false

		});

		this.colorOutput = colorOutput;
		this.luminanceRange = maskLuminance;

	}

	/**
	 * Indicates whether color output is enabled.
	 *
	 * @type {Boolean}
	 */

	get colorOutput() {

		return (this.defines.COLOR !== undefined);

	}

	/**
	 * Enables or disables color output.
	 *
	 * @type {Boolean}
	 */

	set colorOutput(value) {

		value ? (this.defines.COLOR = "1") : (delete this.defines.COLOR);

		this.needsUpdate = true;

	}

	/**
	 * Enables or disables color output.
	 *
	 * @deprecated Use colorOutput instead.
	 * @param {Boolean} enabled - Whether color output should be enabled.
	 */

	setColorOutputEnabled(enabled) {

		enabled ? (this.defines.COLOR = "1") : (delete this.defines.COLOR);

		this.needsUpdate = true;

	}

	/**
	 * Indicates whether luminance masking is enabled.
	 *
	 * @type {Boolean}
	 */

	get luminanceRange() {

		return (this.defines.RANGE !== undefined);

	}

	/**
	 * Enables or disables luminance masking.
	 *
	 * @type {Boolean}
	 */

	set luminanceRange(value) {

		value ? (this.defines.RANGE = "1") : (delete this.defines.RANGE);

		this.needsUpdate = true;

	}

	/**
	 * Enables or disables the luminance mask.
	 *
	 * @deprecated Use luminanceRange instead.
	 * @param {Boolean} enabled - Whether the luminance mask should be enabled.
	 */

	setLuminanceRangeEnabled(enabled) {

		enabled ? (this.defines.RANGE = "1") : (delete this.defines.RANGE);

		this.needsUpdate = true;

	}

}
