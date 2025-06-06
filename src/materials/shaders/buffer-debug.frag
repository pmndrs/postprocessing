#include <common>
#include <dithering_pars_fragment>
#include <packing>

#include <pp_camera_pars_fragment>
#include <pp_default_output_pars_fragment>
#include <pp_input_buffer_pars_fragment>
#include <pp_depth_buffer_pars_fragment>
#include <pp_depth_utils_pars_fragment>
#include <pp_normal_utils_pars_fragment>
#include <pp_world_utils_pars_fragment>

in vec2 vUv;

void main() {

	#if defined(RECONSTRUCT_POSITION)

		float depth = readDepth(depthBuffer, vUv);
		vec3 viewPosition = getViewPosition(vUv, depth);
		out_Color = vec4(getWorldPosition(viewPosition), 1.0);

	#elif defined(DECODE_NORMAL)

		out_Color = vec4(readNormal(inputBuffer, vUv) * 0.5 + 0.5, 1.0);

	#else

		out_Color = texture(inputBuffer, vUv);

		#ifdef COLOR_SPACE_CONVERSION

			#include <colorspace_fragment>

		#endif

		#include <dithering_fragment>

	#endif

}
