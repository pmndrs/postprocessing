import { ShaderChunk } from "three";

// Shader chunks for postprocessing shaders.
import colorspaceParsFragment from "./shaders/colorspace-pars.frag";
import gbufferOutputParsFragment from "./shaders/gbuffer-output-pars.frag";
import precisionFragment from "./shaders/precision.frag";

// Extensions for built-in shaders.
import gbufferNormalFragment from "./shaders/gbuffer-normal.frag";
import gbufferRoughnessFragment from "./shaders/gbuffer-roughness.frag";
import gbufferMetalnessFragment from "./shaders/gbuffer-metalness.frag";

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

		if(Object.hasOwn(ShaderChunk, "pp_extensions")) {

			return;

		}

		Object.defineProperties(ShaderChunk, {
			"pp_extensions": { value: null }, // Registration indicator.
			"pp_colorspace_pars_fragment": { value: colorspaceParsFragment },
			"pp_gbuffer_output_pars_fragment": { value: gbufferOutputParsFragment },
			"pp_precision_fragment": { value: precisionFragment }
		});

		ShaderChunk.normal_fragment_maps += "\n" + gbufferNormalFragment;
		ShaderChunk.roughnessmap_fragment += "\n" + gbufferRoughnessFragment;
		ShaderChunk.metalnessmap_fragment += "\n" + gbufferMetalnessFragment;

	}

}
