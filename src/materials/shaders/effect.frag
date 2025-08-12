#include <common>
#include <dithering_pars_fragment>
#include <packing>

#include <pp_camera_pars_fragment>
#include <pp_colorspace_conversion_pars_fragment>
#include <pp_default_output_pars_fragment>
#include <pp_depth_buffer_precision_pars_fragment>
#include <pp_depth_utils_pars_fragment>
#include <pp_frame_buffer_precision_pars_fragment>
#include <pp_normal_codec_pars_fragment>
#include <pp_normal_utils_pars_fragment>
#include <pp_resolution_pars_fragment>

#define packFloatToRGBA(v) packDepthToRGBA(v)
#define unpackRGBAToFloat(v) unpackRGBAToDepth(v)

$FRAGMENT_HEAD_GDATA
$FRAGMENT_HEAD_GBUFFER

uniform GBuffer gBuffer;
uniform float time;
in vec2 vUv;

$FRAGMENT_HEAD_EFFECTS

void main() {

	$FRAGMENT_MAIN_UV
	$FRAGMENT_MAIN_GDATA

	vec4 color0 = gData.color;
	vec4 color1 = vec4(0.0);

	$FRAGMENT_MAIN_IMAGE

	color0.a = clamp(color0.a, 0.0, 1.0);
	out_Color = color0;

	#ifdef COLOR_SPACE_CONVERSION

		#include <colorspace_fragment>

	#endif

	#include <dithering_fragment>

}
