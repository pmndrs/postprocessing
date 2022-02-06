import { NoBlending, ShaderMaterial, Uniform, UnsignedByteType } from "three";
import { ColorChannel } from "../core/ColorChannel";

import fragmentShader from "./glsl/mask/shader.frag";
import vertexShader from "./glsl/common/shader.vert";

/**
 * A mask function enumeration.
 *
 * @type {Object}
 * @property {Number} DISCARD - Discards elements when the respective mask value is zero.
 * @property {Number} MULTIPLY - Multiplies the input buffer with the mask texture.
 * @property {Number} MULTIPLY_RGB_SET_ALPHA - Multiplies the input RGB values with the mask and sets alpha to the mask value.
 */

export const MaskFunction = {
	DISCARD: 0,
	MULTIPLY: 1,
	MULTIPLY_RGB_SET_ALPHA: 2
};

/**
 * A mask shader material.
 *
 * This material applies a mask texture to a buffer.
 */

export class MaskMaterial extends ShaderMaterial {

	/**
	 * Constructs a new mask material.
	 *
	 * @param {Texture} [maskTexture] - The mask texture.
	 */

	constructor(maskTexture = null) {

		super({
			name: "MaskMaterial",
			uniforms: {
				maskTexture: new Uniform(maskTexture),
				inputBuffer: new Uniform(null),
				strength: new Uniform(1.0)
			},
			blending: NoBlending,
			depthWrite: false,
			depthTest: false,
			fragmentShader,
			vertexShader
		});

		/** @ignore */
		this.toneMapped = false;

		this.setColorChannel(ColorChannel.RED);
		this.setMaskFunction(MaskFunction.DISCARD);

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
	 * Sets the mask texture.
	 *
	 * @type {Texture}
	 * @deprecated Use setMaskTexture() instead.
	 */

	set maskTexture(value) {

		this.setMaskTexture(value);

	}

	/**
	 * Sets the mask texture.
	 *
	 * @param {Texture} value - The texture.
	 */

	setMaskTexture(value) {

		this.uniforms.maskTexture.value = value;
		delete this.defines.MASK_PRECISION_HIGH;

		if(value.type !== UnsignedByteType) {

			this.defines.MASK_PRECISION_HIGH = "1";

		}

		this.needsUpdate = true;

	}

	/**
	 * Sets the color channel to use for masking. Default is `ColorChannel.RED`.
	 *
	 * @type {ColorChannel}
	 * @deprecated Use setColorChannel() instead.
	 */

	set colorChannel(value) {

		this.setColorChannel(value);

	}

	/**
	 * Sets the color channel to use for masking. Default is `ColorChannel.RED`.
	 *
	 * @param {ColorChannel} value - The channel.
	 */

	setColorChannel(value) {

		this.defines.COLOR_CHANNEL = value.toFixed(0);
		this.needsUpdate = true;

	}

	/**
	 * Sets the masking technique. Default is `MaskFunction.DISCARD`.
	 *
	 * @type {MaskFunction}
	 * @deprecated Use setMaskFunction() instead.
	 */

	set maskFunction(value) {

		this.setMaskFunction(value);

	}

	/**
	 * Sets the masking technique. Default is `MaskFunction.DISCARD`.
	 *
	 * @param {MaskFunction} value - The function.
	 */

	setMaskFunction(value) {

		this.defines.MASK_FUNCTION = value.toFixed(0);
		this.needsUpdate = true;

	}

	/**
	 * Indicates whether the masking is inverted.
	 *
	 * @type {Boolean}
	 * @deprecated Use isInverted() instead.
	 */

	get inverted() {

		return this.isInverted();

	}

	/**
	 * Determines whether the masking should be inverted.
	 *
	 * @type {Boolean}
	 * @deprecated Use setInverted() instead.
	 */

	set inverted(value) {

		this.setInverted(value);

	}

	/**
	 * Indicates whether the masking is inverted.
	 *
	 * @return {Boolean} Whether the masking is inverted.
	 */

	isInverted() {

		return (this.defines.INVERTED !== undefined);

	}

	/**
	 * Determines whether the masking should be inverted.
	 *
	 * @param {Boolean} value - Whether the masking should be inverted.
	 */

	setInverted(value) {

		if(this.inverted && !value) {

			delete this.defines.INVERTED;

		} else if(value) {

			this.defines.INVERTED = "1";

		}

		this.needsUpdate = true;

	}

	/**
	 * The current mask strength.
	 *
	 * Individual mask values will be clamped to [0.0, 1.0].
	 *
	 * @type {Number}
	 * @deprecated Use getStrength() instead.
	 */

	get strength() {

		return this.getStrength();

	}

	/**
	 * Sets the mask strength.
	 *
	 * Has no effect when the mask function is set to `DISCARD`.
	 *
	 * @type {Number}
	 * @deprecated Use setStrength() instead.
	 */

	set strength(value) {

		this.setStrength(value);

	}

	/**
	 * Returns the current mask strength.
	 *
	 * Individual mask values will be clamped to [0.0, 1.0].
	 *
	 * @return {Number} The mask strength.
	 */

	getStrength() {

		return this.uniforms.strength.value;

	}

	/**
	 * Sets the mask strength.
	 *
	 * Has no effect when the mask function is set to `DISCARD`.
	 *
	 * @param {Number} value - The mask strength.
	 */

	setStrength(value) {

		this.uniforms.strength.value = value;

	}

}
