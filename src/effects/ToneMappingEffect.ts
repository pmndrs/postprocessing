import { ToneMapping } from "../enums/ToneMapping.js";
import { Effect } from "./Effect.js";

import fragmentShader from "./shaders/tone-mapping.frag";

const toneMappingOperators = new Map<ToneMapping, string>([
	[ToneMapping.CUSTOM, "CustomToneMapping(texel)"],
	[ToneMapping.LINEAR, "LinearToneMapping(texel)"],
	[ToneMapping.REINHARD, "ReinhardToneMapping(texel)"],
	[ToneMapping.CINEON, "CineonToneMapping(texel)"],
	[ToneMapping.ACES_FILMIC, "ACESFilmicToneMapping(texel)"],
	[ToneMapping.AGX, "AgXToneMapping(texel)"],
	[ToneMapping.NEUTRAL, "NeutralToneMapping(texel)"]
]);

/**
 * ToneMappingEffect options.
 *
 * @category Effects
 */

export interface ToneMappingEffectOptions {

	/**
	 * The tone mapping operator.
	 *
	 * @defaultValue {@link ToneMapping.AGX}
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

			const operator = toneMappingOperators.get(value);

			if(operator === undefined) {

				throw new Error(`Invalid tone mapping: ${value}`);

			}

			defines.set("toneMapping(texel)", operator);
			this.setChanged();

		}

	}

}
