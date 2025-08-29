import { ShaderChunk } from "three";
import { CDLPreset } from "../enums/CDLPreset.js";
import { ToneMapping } from "../enums/ToneMapping.js";
import { ColorDecisionList } from "../utils/ColorDecisionList.js";
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
	 *
	 * @defaultValue {@link ToneMapping.AGX}
	 */

	toneMapping?: ToneMapping;

	/**
	 * A CDL Preset. Only applies to {@link ToneMapping.AGX}.
	 *
	 * @defaultValue null
	 */

	cdlPreset?: CDLPreset | null;

}

/**
 * A tone mapping effect.
 *
 * @category Effects
 */

export class ToneMappingEffect extends Effect implements ToneMappingEffectOptions {

	/**
	 * ASC CDL settings for primary color grading.
	 */

	readonly cdl: ColorDecisionList;

	/**
	 * Constructs a new tone mapping effect.
	 *
	 * @param options - The options.
	 */

	constructor({ toneMapping = ToneMapping.AGX, cdlPreset = null }: ToneMappingEffectOptions = {}) {

		super("ToneMappingEffect");

		this.fragmentShader = fragmentShader.replace(
			// Resolve the #include early to ensure that applyCDL gets prefixed.
			// This is only necessary because the shader chunk uses a function from the effect shader.
			"#include <tonemapping_pars_fragment>",
			ShaderChunk.tonemapping_pars_fragment.replace(
				/(color = AgXOutsetMatrix \* color;)/,
				"color = applyCDL(color);\n$1"
			)
		);

		this.cdl = new ColorDecisionList();
		this.cdl.addEventListener("toggle", () => this.onCDLToggle());

		this.input.uniforms.set("cdl", this.cdl.uniform);
		this.input.defines.set("USE_CDL", true);

		this.toneMapping = toneMapping;
		this.cdl.applyPreset(cdlPreset);

	}

	get toneMapping(): ToneMapping {

		return this.input.defines.get("TONE_MAPPING") as ToneMapping;

	}

	set toneMapping(value: ToneMapping) {

		if(this.toneMapping !== value) {

			const defines = this.input.defines;
			defines.set("TONE_MAPPING", value);
			this.setChanged();

		}

	}

	/**
	 * Performs tasks when the CDL is enabled or disabled.
	 */

	private onCDLToggle(): void {

		if(this.cdl.enabled) {

			this.input.defines.set("USE_CDL", true);

		} else {

			this.input.defines.delete("USE_CDL");

		}

		this.setChanged();

	}

}
