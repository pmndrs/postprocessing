#include <common>
#include <pp_default_output_pars_fragment>

#ifdef COLOR_WRITE

	#include <dithering_pars_fragment>
	#include <pp_input_buffer_pars_fragment>

#endif

#ifdef DEPTH_WRITE

	#include <pp_depth_buffer_pars_fragment>

#endif

#ifdef USE_WEIGHTS

	uniform vec4 channelWeights;

#endif

in vec2 vUv;

void main() {

	#ifdef COLOR_WRITE

		vec4 texel = texture2D(inputBuffer, vUv);

		#ifdef USE_WEIGHTS

			texel *= channelWeights;

		#endif

		out_Color = texel;

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
