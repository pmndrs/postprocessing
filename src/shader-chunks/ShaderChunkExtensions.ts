import { ShaderChunk, ShaderLib } from "three";

// Shader chunks for postprocessing shaders.
import cameraParsFragment from "./shaders/camera-pars.frag";
import colorspaceConversionParsFragment from "./shaders/colorspace-conversion-pars.frag";
import defaultOutputParsFragment from "./shaders/default-output-pars.frag";
import depthBufferParsFragment from "./shaders/depth-buffer-pars.frag";
import depthBufferPrecisionParsFragment from "./shaders/depth-buffer-precision-pars.frag";
import depthUtilsParsFragment from "./shaders/depth-utils-pars.frag";
import frameBufferPrecisionParsFragment from "./shaders/frame-buffer-precision-pars.frag";
import inputBufferParsFragment from "./shaders/input-buffer-pars.frag";
import normalUtilsParsFragment from "./shaders/normal-utils-pars.frag";
import resolutionParsFragment from "./shaders/resolution-pars.frag";
import worldUtilsParsFragment from "./shaders/world-utils-pars.frag";

// Extensions for built-in shaders.
import normalCodecParsFragment from "./shaders/normal-codec-pars.frag";
import gbufferDefaultOutputFragment from "./shaders/gbuffer-default-output.frag";
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
	 * Registers custom shader chunks.
	 */

	static register(): void {

		if(Object.hasOwn(ShaderChunk, "pp_extensions")) {

			return;

		}

		Object.assign(ShaderChunk, {
			"pp_extensions": null, // Serves as a registration indicator.
			"pp_camera_pars_fragment": cameraParsFragment,
			"pp_colorspace_conversion_pars_fragment": colorspaceConversionParsFragment,
			"pp_default_output_pars_fragment": defaultOutputParsFragment,
			"pp_default_output_fragment": gbufferDefaultOutputFragment,
			"pp_depth_buffer_pars_fragment": depthBufferParsFragment,
			"pp_depth_buffer_precision_pars_fragment": depthBufferPrecisionParsFragment,
			"pp_depth_utils_pars_fragment": depthUtilsParsFragment,
			"pp_frame_buffer_precision_pars_fragment": frameBufferPrecisionParsFragment,
			"pp_input_buffer_pars_fragment": inputBufferParsFragment,
			"pp_normal_utils_pars_fragment": normalUtilsParsFragment,
			"pp_resolution_pars_fragment": resolutionParsFragment,
			"pp_world_utils_pars_fragment": worldUtilsParsFragment
		});

		ShaderChunk.packing += "\n" + normalCodecParsFragment;
		ShaderChunk.normal_fragment_maps += "\n" + gbufferNormalFragment;
		ShaderChunk.aomap_fragment += "\n" + gbufferOcclusionFragment;
		ShaderChunk.roughnessmap_fragment += "\n" + gbufferRoughnessFragment;
		ShaderChunk.metalnessmap_fragment += "\n" + gbufferMetalnessFragment;
		ShaderChunk.emissivemap_fragment += "\n" + gbufferEmissionFragment;

		// Let non-PBR shaders write default values.

		ShaderLib.background.fragmentShader = ShaderLib.background.fragmentShader.replace(
			/(#include <tonemapping_fragment>)/,
			"#include <pp_default_output_fragment>\n$1"
		);

		const shaders = [
			ShaderLib.basic,
			ShaderLib.lambert,
			ShaderLib.phong,
			ShaderLib.matcap,
			ShaderLib.points,
			ShaderLib.dashed,
			ShaderLib.sprite
		];

		for(const shader of shaders) {

			shader.fragmentShader = shader.fragmentShader.replace(
				/(#include <clipping_planes_fragment>)/,
				"$1\n\n#include <pp_default_output_fragment>"
			);

		}

	}

}
