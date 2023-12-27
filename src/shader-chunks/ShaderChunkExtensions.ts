import { ShaderChunk } from "three";

// Shader chunks for postprocessing shaders.
import cameraParsFragment from "./shaders/camera-pars.frag";
import colorspaceParsFragment from "./shaders/colorspace-pars.frag";
import defaultOutputParsFragment from "./shaders/default-output-pars.frag";
import depthBufferParsFragment from "./shaders/depth-buffer-pars.frag";
import depthUtilsParsFragment from "./shaders/depth-utils-pars.frag";
import gbufferOutputParsFragment from "./shaders/gbuffer-output-pars.frag";
import inputBufferParsFragment from "./shaders/input-buffer-pars.frag";
import precisionFragment from "./shaders/precision.frag";
import resolutionParsFragment from "./shaders/resolution-pars.frag";

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
			"pp_extensions": { value: null }, // Serves as a registration indicator.
			"pp_camera_pars_fragment": { value: cameraParsFragment },
			"pp_colorspace_pars_fragment": { value: colorspaceParsFragment },
			"pp_default_output_pars_fragment": { value: defaultOutputParsFragment },
			"pp_depth_buffer_pars_fragment": { value: depthBufferParsFragment },
			"pp_depth_utils_pars_fragment": { value: depthUtilsParsFragment },
			"pp_gbuffer_output_pars_fragment": { value: gbufferOutputParsFragment },
			"pp_input_buffer_pars_fragment": { value: inputBufferParsFragment },
			"pp_precision_fragment": { value: precisionFragment },
			"pp_resolution_pars_fragment": { value: resolutionParsFragment }
		});

		ShaderChunk.normal_fragment_maps += "\n" + gbufferNormalFragment;
		ShaderChunk.roughnessmap_fragment += "\n" + gbufferRoughnessFragment;
		ShaderChunk.metalnessmap_fragment += "\n" + gbufferMetalnessFragment;

	}

}