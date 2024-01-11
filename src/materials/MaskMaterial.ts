import { Texture, Uniform, UnsignedByteType } from "three";
import { ColorChannel } from "../enums/ColorChannel.js";
import { MaskFunction } from "../enums/MaskFunction.js";
import { FullscreenMaterial } from "./FullscreenMaterial.js";

import fragmentShader from "./shaders/mask.frag";
import vertexShader from "./shaders/common.vert";

/**
 * A mask shader material.
 *
 * @category Materials
 */

export class MaskMaterial extends FullscreenMaterial {

	/**
	 * Constructs a new mask material.
	 *
	 * @param maskTexture - A mask texture.
	 */

	constructor(maskTexture: Texture | null = null) {

		super({
			name: "MaskMaterial",
			fragmentShader,
			vertexShader,
			defines: {
				COLOR_CHANNEL: ColorChannel.RED,
				MASK_FUNCTION: MaskFunction.DISCARD
			},
			uniforms: {
				maskTexture: new Uniform(maskTexture),
				strength: new Uniform(1.0)
			}
		});

	}

	/**
	 * The mask texture.
	 */

	set maskTexture(value: Texture | null) {

		this.uniforms.maskTexture.value = value;
		delete this.defines.MASK_PRECISION_HIGH;

		if(value?.type !== UnsignedByteType) {

			this.defines.MASK_PRECISION_HIGH = true;

		}

		this.needsUpdate = true;

	}

	/**
	 * The color channel to use for masking. Default is `ColorChannel.RED`.
	 */

	get colorChannel(): ColorChannel {

		return this.defines.COLOR_CHANNEL as ColorChannel;

	}

	set colorChannel(value: ColorChannel) {

		this.defines.COLOR_CHANNEL = value;
		this.needsUpdate = true;

	}

	/**
	 * The masking technique. Default is `MaskFunction.DISCARD`.
	 */

	get maskFunction(): MaskFunction {

		return this.defines.MASK_FUNCTION as MaskFunction;

	}

	set maskFunction(value: MaskFunction) {

		this.defines.MASK_FUNCTION = value;
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

			this.defines.INVERTED = true;

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
