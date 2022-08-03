import { NoBlending, REVISION, ShaderMaterial, Uniform } from "three";

import fragmentShader from "./glsl/luminance.frag";
import vertexShader from "./glsl/common.vert";

/**
 * A luminance shader material.
 *
 * This shader produces a greyscale luminance map that describes the absolute amount of light emitted by a scene. It can
 * also be configured to output colors that are scaled with their respective luminance value. Additionally, a range may
 * be provided to mask out undesired texels.
 *
 * The alpha channel always contains the luminance value.
 *
 * On luminance coefficients:
 *  http://www.poynton.com/notes/colour_and_gamma/ColorFAQ.html#RTFToC9
 *
 * Coefficients for different color spaces:
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

		super({
			name: "LuminanceMaterial",
			defines: {
				THREE_REVISION: REVISION.replace(/\D+/g, "")
			},
			uniforms: {
				inputBuffer: new Uniform(null),
				threshold: new Uniform(0.0),
				smoothing: new Uniform(1.0),
				range: new Uniform(null)
			},
			blending: NoBlending,
			depthWrite: false,
			depthTest: false,
			fragmentShader,
			vertexShader
		});

		/** @ignore */
		this.toneMapped = false;

		this.colorOutput = colorOutput;
		this.luminanceRange = luminanceRange;

	}

	/**
	 * The input buffer.
	 *
	 * @type {Texture}
	 */

	set inputBuffer(value) {

		this.uniforms.inputBuffer.value = value;

	}

	/**
	 * Sets the input buffer.
	 *
	 * @deprecated Use inputBuffer instead.
	 * @param {Texture} value - The input buffer.
	 */

	setInputBuffer(value) {

		this.uniforms.inputBuffer.value = value;

	}

	/**
	 * The luminance threshold.
	 *
	 * @type {Number}
	 */

	get threshold() {

		return this.uniforms.threshold.value;

	}

	set threshold(value) {

		if(this.smoothing > 0 || value > 0) {

			this.defines.THRESHOLD = "1";

		} else {

			delete this.defines.THRESHOLD;

		}

		this.uniforms.threshold.value = value;

	}

	/**
	 * Returns the luminance threshold.
	 *
	 * @deprecated Use threshold instead.
	 * @return {Number} The threshold.
	 */

	getThreshold() {

		return this.threshold;

	}

	/**
	 * Sets the luminance threshold.
	 *
	 * @deprecated Use threshold instead.
	 * @param {Number} value - The threshold.
	 */

	setThreshold(value) {

		this.threshold = value;

	}

	/**
	 * The luminance threshold smoothing.
	 *
	 * @type {Number}
	 */

	get smoothing() {

		return this.uniforms.smoothing.value;

	}

	set smoothing(value) {

		if(this.threshold > 0 || value > 0) {

			this.defines.THRESHOLD = "1";

		} else {

			delete this.defines.THRESHOLD;

		}

		this.uniforms.smoothing.value = value;

	}

	/**
	 * Returns the luminance threshold smoothing factor.
	 *
	 * @deprecated Use smoothing instead.
	 * @return {Number} The smoothing factor.
	 */

	getSmoothingFactor() {

		return this.smoothing;

	}

	/**
	 * Sets the luminance threshold smoothing factor.
	 *
	 * @deprecated Use smoothing instead.
	 * @param {Number} value - The smoothing factor.
	 */

	setSmoothingFactor(value) {

		this.smoothing = value;

	}

	/**
	 * Indicates whether the luminance threshold is enabled.
	 *
	 * @type {Boolean}
	 * @deprecated Adjust the threshold or smoothing factor instead.
	 */

	get useThreshold() {

		return (this.threshold > 0 || this.smoothing > 0);

	}

	set useThreshold(value) {}

	/**
	 * Indicates whether color output is enabled.
	 *
	 * @type {Boolean}
	 */

	get colorOutput() {

		return (this.defines.COLOR !== undefined);

	}

	set colorOutput(value) {

		if(value) {

			this.defines.COLOR = "1";

		} else {

			delete this.defines.COLOR;

		}

		this.needsUpdate = true;

	}

	/**
	 * Indicates whether color output is enabled.
	 *
	 * @deprecated Use colorOutput instead.
	 * @return {Boolean} Whether color output is enabled.
	 */

	isColorOutputEnabled(value) {

		return this.colorOutput;

	}

	/**
	 * Enables or disables color output.
	 *
	 * @deprecated Use colorOutput instead.
	 * @param {Boolean} value - Whether color output should be enabled.
	 */

	setColorOutputEnabled(value) {

		this.colorOutput = value;

	}

	/**
	 * Indicates whether luminance masking is enabled.
	 *
	 * @type {Boolean}
	 * @deprecated
	 */

	get useRange() {

		return (this.luminanceRange !== null);

	}

	set useRange(value) {

		this.luminanceRange = null;

	}

	/**
	 * The luminance range. Set to null to disable.
	 *
	 * @type {Boolean}
	 */

	get luminanceRange() {

		return this.uniforms.range.value;

	}

	set luminanceRange(value) {

		if(value !== null) {

			this.defines.RANGE = "1";

		} else {

			delete this.defines.RANGE;

		}

		this.uniforms.range.value = value;
		this.needsUpdate = true;

	}

	/**
	 * Returns the current luminance range.
	 *
	 * @deprecated Use luminanceRange instead.
	 * @return {Vector2} The luminance range.
	 */

	getLuminanceRange() {

		return this.luminanceRange;

	}

	/**
	 * Sets a luminance range. Set to null to disable.
	 *
	 * @deprecated Use luminanceRange instead.
	 * @param {Vector2} value - The luminance range.
	 */

	setLuminanceRange(value) {

		this.luminanceRange = value;

	}

}
