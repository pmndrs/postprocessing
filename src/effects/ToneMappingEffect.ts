import { ToneMapping } from "../enums/ToneMapping.js";
import { Effect } from "./Effect.js";

import fragmentShader from "./shaders/tone-mapping.frag";

/**
 * ToneMappingEffect options.
 *
 * @category Effects
 */

export interface ToneMappingEffectOptions {

	/**
	 * The tone mapping operator.
	 */

	toneMapping?: ToneMapping;

}

/**
 * A tone mapping effect.
 *
 * @category Effects
 */

export class ToneMappingEffect extends Effect {

	/**
	 * Constructs a new tone mapping effect.
	 *
	 * @param options - The options.
	 */

	constructor({ toneMapping = ToneMapping.AGX }: ToneMappingEffectOptions = {}) {

		super("ToneMappingEffect");

		this.fragmentShader = fragmentShader;
		this.toneMapping = toneMapping;

	}

	/**
	 * The tone mapping mode.
	 */

	get toneMapping(): ToneMapping {

		return this.input.defines.get("TONE_MAPPING") as ToneMapping;

	}

	set toneMapping(value: ToneMapping) {

		if(this.toneMapping !== value) {

			const defines = this.input.defines;
			defines.clear();
			defines.set("TONE_MAPPING", value);

			// Use one of three's built-in tone mapping operators.
			switch(value) {

				case ToneMapping.REINHARD:
					defines.set("toneMapping(texel)", "ReinhardToneMapping(texel)");
					break;

				case ToneMapping.OPTIMIZED_CINEON:
					defines.set("toneMapping(texel)", "OptimizedCineonToneMapping(texel)");
					break;

				case ToneMapping.ACES_FILMIC:
					defines.set("toneMapping(texel)", "ACESFilmicToneMapping(texel)");
					break;

				case ToneMapping.AGX:
					defines.set("toneMapping(texel)", "AgXToneMapping(texel)");
					break;

				default:
					defines.set("toneMapping(texel)", "texel");
					break;

			}

			this.setChanged();

		}

	}

}
