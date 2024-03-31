import { ShaderChunk, ShaderLib } from "three";

// Shader chunks for postprocessing shaders.
import cameraParsFragment from "./shaders/camera-pars.frag";
import colorspaceParsFragment from "./shaders/colorspace-pars.frag";
import colorspaceConversionParsFragment from "./shaders/colorspace-conversion-pars.frag";
import defaultOutputParsFragment from "./shaders/default-output-pars.frag";
import depthBufferParsFragment from "./shaders/depth-buffer-pars.frag";
import depthBufferPrecisionParsFragment from "./shaders/depth-buffer-precision-pars.frag";
import depthUtilsParsFragment from "./shaders/depth-utils-pars.frag";
import frameBufferPrecisionParsFragment from "./shaders/frame-buffer-precision-pars.frag";
import inputBufferParsFragment from "./shaders/input-buffer-pars.frag";
import precisionFragment from "./shaders/precision.frag";
import resolutionParsFragment from "./shaders/resolution-pars.frag";

// Extensions for built-in shaders.
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

		Object.defineProperties(ShaderChunk, {
			"pp_extensions": { value: null }, // Serves as a registration indicator.
			"pp_camera_pars_fragment": { value: cameraParsFragment },
			"pp_colorspace_pars_fragment": { value: colorspaceParsFragment },
			"pp_colorspace_conversion_pars_fragment": { value: colorspaceConversionParsFragment },
			"pp_default_output_pars_fragment": { value: defaultOutputParsFragment },
			"pp_default_output_fragment": { value: gbufferDefaultOutputFragment },
			"pp_depth_buffer_pars_fragment": { value: depthBufferParsFragment },
			"pp_depth_buffer_precision_pars_fragment": { value: depthBufferPrecisionParsFragment },
			"pp_depth_utils_pars_fragment": { value: depthUtilsParsFragment },
			"pp_frame_buffer_precision_pars_fragment": { value: frameBufferPrecisionParsFragment },
			"pp_input_buffer_pars_fragment": { value: inputBufferParsFragment },
			"pp_precision_fragment": { value: precisionFragment },
			"pp_resolution_pars_fragment": { value: resolutionParsFragment }
		});

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
