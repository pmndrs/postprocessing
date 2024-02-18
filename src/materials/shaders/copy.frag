#include <pp_precision_fragment>

#include <common>

#include <pp_default_output_pars_fragment>

#ifdef COLOR_WRITE

	#include <colorspace_pars_fragment>
	#include <dithering_pars_fragment>

	#include <pp_colorspace_pars_fragment>
	#include <pp_input_buffer_pars_fragment>

#endif

#ifdef DEPTH_WRITE

	#include <pp_depth_buffer_pars_fragment>

#endif

in vec2 vUv;

void main() {

	#ifdef COLOR_WRITE

		out_Color = texture(inputBuffer, vUv);

		#ifdef COLOR_SPACE_CONVERSION

			#include <colorspace_fragment>

		#endif

		#include <dithering_fragment>

	#else

		out_Color = vec4(0.0);

	#endif

	#ifdef DEPTH_WRITE

		gl_FragDepth = texture(depthBuffer, vUv).r;

	#endif

}
