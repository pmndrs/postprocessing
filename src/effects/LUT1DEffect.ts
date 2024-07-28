import { FloatType, HalfFloatType, Texture, Uniform } from "three";
import { Effect } from "./Effect.js";

import fragmentShader from "./shaders/lut-1d.frag";

/**
 * A 1D LUT effect.
 *
 * @see https://affinityspotlight.com/article/1d-vs-3d-luts/
 * @category Effects
 */

export class LUT1DEffect extends Effect {

	/**
	 * Constructs a new LUT effect.
	 */

	constructor(lut: Texture) {

		super("LUT1DEffect");

		this.fragmentShader = fragmentShader;
		this.input.uniforms.set("lut", new Uniform(null));
		this.lut = lut;

	}

	/**
	 * Indicates whether the LUT uses high precision.
	 */

	private get lutPrecisionHigh(): boolean {

		return this.input.defines.has("LUT_PRECISION_HIGH");

	}

	private set lutPrecisionHigh(value: boolean) {

		if(this.lutPrecisionHigh !== value) {

			if(value) {

				this.input.defines.set("LUT_PRECISION_HIGH", true);

			} else {

				this.input.defines.delete("LUT_PRECISION_HIGH");

			}

			this.setChanged();

		}

	}

	/**
	 * The LUT.
	 */

	get lut(): Texture {

		return this.input.uniforms.get("lut")!.value as Texture;

	}

	set lut(value: Texture) {

		this.input.uniforms.get("lut")!.value = value;
		this.lutPrecisionHigh = (value.type === FloatType || value.type === HalfFloatType);

	}

}
