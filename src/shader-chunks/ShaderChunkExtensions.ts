import { ShaderChunk, ShaderLib } from "three";

// Shader chunks for postprocessing shaders.
import cameraParsFragment from "./shaders/camera-pars.frag";
import colorspaceConversionParsFragment from "./shaders/colorspace-conversion-pars.frag";
import defaultOutputParsFragment from "./shaders/default-output-pars.frag";
import depthBufferParsFragment from "./shaders/depth-buffer-pars.frag";
import depthBufferPrecisionParsFragment from "./shaders/depth-buffer-precision-pars.frag";
import depthUtilsParsFragment from "./shaders/depth-utils-pars.frag";
import frameBufferPrecisionParsFragment from "./shaders/frame-buffer-precision-pars.frag";
import gbufferDefaultOutputFragment from "./shaders/gbuffer-default-output.frag";
import inputBufferParsFragment from "./shaders/input-buffer-pars.frag";
import normalCodecParsFragment from "./shaders/normal-codec-pars.frag";
import normalUtilsParsFragment from "./shaders/normal-utils-pars.frag";
import resolutionParsFragment from "./shaders/resolution-pars.frag";
import worldUtilsParsFragment from "./shaders/world-utils-pars.frag";

// G-Buffer shader chunks for built-in materials.
import gbufferNormalFragment from "./shaders/gbuffer-normal.frag";
import gbufferOcclusionFragment from "./shaders/gbuffer-occlusion.frag";
import gbufferRoughnessFragment from "./shaders/gbuffer-roughness.frag";
import gbufferMetalnessFragment from "./shaders/gbuffer-metalness.frag";
import gbufferEmissionFragment from "./shaders/gbuffer-emission.frag";

/**
 * A collection of custom shader chunks.
 *
 * @category Shader Chunks
 * @internal
 */

export class ShaderChunkExtensions {

	/**
	 * Indicates whether the custom shader chunks have been registered.
	 */

	private static registered = false;

	/**
	 * Registers custom shader chunks.
	 */

	static register(): void {

		if(ShaderChunkExtensions.registered) {

			return;

		}

		ShaderChunkExtensions.registered = true;

		// Custom Shader Chunk Registration

		Object.assign(ShaderChunk, {
			"pp_camera_pars_fragment": cameraParsFragment,
			"pp_colorspace_conversion_pars_fragment": colorspaceConversionParsFragment,
			"pp_default_output_pars_fragment": defaultOutputParsFragment,
			"pp_default_output_fragment": gbufferDefaultOutputFragment,
			"pp_depth_buffer_pars_fragment": depthBufferParsFragment,
			"pp_depth_buffer_precision_pars_fragment": depthBufferPrecisionParsFragment,
			"pp_depth_utils_pars_fragment": depthUtilsParsFragment,
			"pp_frame_buffer_precision_pars_fragment": frameBufferPrecisionParsFragment,
			"pp_input_buffer_pars_fragment": inputBufferParsFragment,
			"pp_normal_codec_pars_fragment": normalCodecParsFragment,
			"pp_normal_utils_pars_fragment": normalUtilsParsFragment,
			"pp_resolution_pars_fragment": resolutionParsFragment,
			"pp_world_utils_pars_fragment": worldUtilsParsFragment
		});

		// G-Buffer Support

		ShaderChunk.normal_fragment_maps += "\n" + gbufferNormalFragment;
		ShaderChunk.aomap_fragment += "\n" + gbufferOcclusionFragment;
		ShaderChunk.roughnessmap_fragment += "\n" + gbufferRoughnessFragment;
		ShaderChunk.metalnessmap_fragment += "\n" + gbufferMetalnessFragment;
		ShaderChunk.emissivemap_fragment += "\n" + gbufferEmissionFragment;

		const shaders = [
			ShaderLib.background,
			ShaderLib.backgroundCube,
			ShaderLib.basic,
			ShaderLib.cube,
			ShaderLib.dashed,
			ShaderLib.lambert,
			ShaderLib.matcap,
			ShaderLib.phong,
			ShaderLib.physical,
			ShaderLib.points,
			ShaderLib.sprite,
			ShaderLib.standard,
			ShaderLib.toon
		];

		for(const shader of shaders) {

			// Ensure that all shaders write default values.
			shader.fragmentShader = shader.fragmentShader.replace(
				/(^ *void\s+main\(\)\s+{.*)/m,
				"#include <pp_normal_codec_pars_fragment>\n\n$1\n\n#include <pp_default_output_fragment>"
			);

		}

	}

}
