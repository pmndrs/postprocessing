import { NoBlending, ShaderMaterial, Texture, Uniform, UnsignedByteType } from "three";
import { ColorChannel } from "../enums/ColorChannel.js";
import { MaskFunction } from "../enums/MaskFunction.js";

import fragmentShader from "./shaders/mask.frag";
import vertexShader from "./shaders/common.vert";

/**
 * A mask shader material.
 *
 * @group Materials
 */

export class MaskMaterial extends ShaderMaterial {

	/**
	 * Constructs a new mask material.
	 *
	 * @param maskTexture - A mask texture.
	 */

	constructor(maskTexture: Texture | null = null) {

		super({
			name: "MaskMaterial",
			uniforms: {
				maskTexture: new Uniform(maskTexture),
				inputBuffer: new Uniform(null),
				strength: new Uniform(1.0)
			},
			blending: NoBlending,
			toneMapped: false,
			depthWrite: false,
			depthTest: false,
			fragmentShader,
			vertexShader
		});

		this.colorChannel = ColorChannel.RED;
		this.maskFunction = MaskFunction.DISCARD;

	}

	/**
	 * The input buffer.
	 */

	set inputBuffer(value: Texture | null) {

		this.uniforms.inputBuffer.value = value;

	}

	/**
	 * The mask texture.
	 */

	set maskTexture(value: Texture | null) {

		this.uniforms.maskTexture.value = value;
		delete this.defines.MASK_PRECISION_HIGH;

		if(value?.type !== UnsignedByteType) {

			this.defines.MASK_PRECISION_HIGH = "1";

		}

		this.needsUpdate = true;

	}

	/**
	 * Sets the color channel to use for masking. Default is `ColorChannel.RED`.
	 */

	set colorChannel(value: ColorChannel) {

		this.defines.COLOR_CHANNEL = value.toFixed(0);
		this.needsUpdate = true;

	}

	/**
	 * The masking technique. Default is `MaskFunction.DISCARD`.
	 */

	set maskFunction(value: MaskFunction) {

		this.defines.MASK_FUNCTION = value.toFixed(0);
		this.needsUpdate = true;

	}

	/**
	 * Indicates whether the masking is inverted.
	 */

	get inverted(): boolean {

		return (this.defines.INVERTED !== undefined);

	}

	set inverted(value: boolean) {

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
	 * Individual mask values will be clamped to [0.0, 1.0]. Has no effect when the mask function is set to `DISCARD`.
	 *
	 * @type {Number}
	 */

	get strength(): number {

		return this.uniforms.strength.value as number;

	}

	set strength(value: number) {

		this.uniforms.strength.value = value;

	}

}
