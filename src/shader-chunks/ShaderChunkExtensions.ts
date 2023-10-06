import { ShaderChunk } from "three";

import precisionFragment from "./shaders/precision.frag";
import outputParsFragment from "./shaders/output-pars.frag";

/**
 * A collection of custom shader chunks.
 *
 * @group Shader Chunks
 * @internal
 */

export class ShaderChunkExtensions {

	/**
	 * Registers custom shader chunks.
	 */

	static register(): void {

		if(Object.hasOwn(ShaderChunk, "pp_precision_fragment")) {

			return;

		}

		Object.defineProperties(ShaderChunk, {
			"pp_precision_fragment": { value: precisionFragment },
			"pp_output_pars_fragment": { value: outputParsFragment }
		});



	}

}
