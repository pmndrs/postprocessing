#include <pp_precision_fragment>
#include <pp_default_output_pars_fragment>
#include <pp_camera_pars_fragment>
#include <pp_resolution_pars_fragment>
#include <pp_depth_utils_pars_fragment>
#include <pp_colorspace_conversion_pars_fragment>
#include <pp_colorspace_pars_fragment>

#include <common>
#include <packing>
#include <dithering_pars_fragment>

#define packFloatToRGBA(v) packDepthToRGBA(v)
#define unpackRGBAToFloat(v) unpackRGBAToDepth(v)

// TODO GData struct uniform

uniform float time;
in vec2 vUv;

FRAGMENT_HEAD

void main() {

	FRAGMENT_MAIN_UV

	vec4 color0 = texture(inputBuffer, UV);
	vec4 color1 = vec4(0.0);

	FRAGMENT_MAIN_IMAGE

	color0.a = clamp(color0.a, 0.0, 1.0);
	outputColor = color0;

	#ifdef COLOR_SPACE_CONVERSION

		#include <colorspace_fragment>

	#endif

	#include <dithering_fragment>

}
