import { NoBlending, ShaderMaterial, Uniform } from "three";

import fragmentShader from "./glsl/luminance/shader.frag";
import vertexShader from "./glsl/common/shader.vert";

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

		this.setColorOutputEnabled(colorOutput);
		this.setThresholdEnabled(true);
		this.setLuminanceRange(luminanceRange);

	}

	/**
	 * Sets the input buffer.
	 *
	 * @param {Texture} value - The input buffer.
	 */

	setInputBuffer(value) {

		this.uniforms.inputBuffer.value = value;

	}

	/**
	 * The luminance threshold.
	 *
	 * @type {Number}
	 * @deprecated Use getThreshold() instead.
	 */

	get threshold() {

		return this.getThreshold();

	}

	/**
	 * Sets the luminance threshold.
	 *
	 * @type {Number}
	 * @deprecated Use setThreshold() instead.
	 */

	set threshold(value) {

		this.setThreshold(value);

	}

	/**
	 * Returns the luminance threshold.
	 *
	 * @return {Number} The threshold.
	 */

	getThreshold() {

		return this.uniforms.threshold.value;

	}

	/**
	 * Sets the luminance threshold.
	 *
	 * @param {Number} value - The threshold.
	 */

	setThreshold(value) {

		if(this.getSmoothingFactor() > 0 || value > 0) {

			this.defines.THRESHOLD = "1";

		} else {

			delete this.defines.THRESHOLD;

		}

		this.uniforms.threshold.value = value;

	}

	/**
	 * The luminance threshold smoothing.
	 *
	 * @type {Number}
	 * @deprecated Use getSmoothingFactor() instead.
	 */

	get smoothing() {

		return this.getSmoothing();

	}

	/**
	 * Sets the luminance threshold smoothing.
	 *
	 * @type {Number}
	 * @deprecated Use setSmoothingFactor() instead.
	 */

	set smoothing(value) {

		this.setSmoothing(value);

	}

	/**
	 * Returns the luminance threshold smoothing factor.
	 *
	 * @return {Number} The smoothing factor.
	 */

	getSmoothingFactor() {

		return this.uniforms.smoothing.value;

	}

	/**
	 * Sets the luminance threshold smoothing factor.
	 *
	 * @param {Number} value - The smoothing factor.
	 */

	setSmoothingFactor(value) {

		if(this.getThreshold() > 0 || value > 0) {

			this.defines.THRESHOLD = "1";

		} else {

			delete this.defines.THRESHOLD;

		}

		this.uniforms.smoothing.value = value;

	}

	/**
	 * Indicates whether the luminance threshold is enabled.
	 *
	 * @type {Boolean}
	 * @deprecated Adjust the threshold or smoothing factor instead.
	 */

	get useThreshold() {

		return this.isThresholdEnabled();

	}

	/**
	 * Enables or disables the luminance threshold.
	 *
	 * @type {Boolean}
	 * @deprecated Adjust the threshold or smoothing factor instead.
	 */

	set useThreshold(value) {

		this.setThresholdEnabled(value);

	}

	/**
	 * Indicates whether color output is enabled.
	 *
	 * @type {Boolean}
	 * @deprecated Use isColorOutputEnabled() instead.
	 */

	get colorOutput() {

		return this.isColorOutputEnabled();

	}

	/**
	 * Enables or disables color output.
	 *
	 * @type {Boolean}
	 * @deprecated Use setColorOutputEnabled() instead.
	 */

	set colorOutput(value) {

		this.setColorOutputEnabled(value);

	}

	/**
	 * Indicates whether color output is enabled.
	 *
	 * @return {Boolean} Whether color output is enabled.
	 */

	isColorOutputEnabled(value) {

		return (this.defines.COLOR !== undefined);

	}

	/**
	 * Enables or disables color output.
	 *
	 * @param {Boolean} value - Whether color output should be enabled.
	 */

	setColorOutputEnabled(value) {

		if(value) {

			this.defines.COLOR = "1";

		} else {

			delete this.defines.COLOR;

		}

		this.needsUpdate = true;

	}

	/**
	 * Indicates whether luminance masking is enabled.
	 *
	 * @type {Boolean}
	 * @deprecated Use getLuminanceRange() instead.
	 */

	get useRange() {

		return this.isLuminanceRangeEnabled();

	}

	/**
	 * Enables or disables luminance masking.
	 *
	 * If enabled, the threshold will be ignored.
	 *
	 * @type {Boolean}
	 * @deprecated Use setLuminanceRange() instead.
	 */

	set useRange(value) {

		this.setLuminanceRangeEnabled(value);

	}

	/**
	 * Indicates whether luminance masking is enabled.
	 *
	 * @type {Boolean}
	 * @deprecated Use getLuminanceRange() instead.
	 */

	get luminanceRange() {

		return (this.getLuminanceRange() !== null);

	}

	/**
	 * Enables or disables luminance masking.
	 *
	 * @type {Boolean}
	 * @deprecated Use setLuminanceRange() instead.
	 */

	set luminanceRange(value) {}

	/**
	 * Returns the current luminance range.
	 *
	 * @return {Vector2} The luminance range.
	 */

	getLuminanceRange() {

		return this.uniforms.range.value;

	}

	/**
	 * Sets a luminance range. Set to null to disable.
	 *
	 * @param {Vector2} value - The luminance range.
	 */

	setLuminanceRange(value) {

		if(value !== null) {

			this.defines.RANGE = "1";

		} else {

			delete this.defines.RANGE;

		}

		this.uniforms.range.value = value;
		this.needsUpdate = true;

	}

}
