#include <pp_precision_fragment>
#include <pp_default_output_pars_fragment>
#include <pp_input_buffer_pars_fragment>
#include <common>

#ifdef THRESHOLD

	uniform float threshold;
	uniform float smoothing;

#endif

in vec2 vUv;

void main() {

	vec4 texel = texture(inputBuffer, vUv);
	float l = luminance(texel.rgb);

	#ifdef THRESHOLD

		l = smoothstep(threshold, threshold + smoothing, l);

	#endif

	#ifdef COLOR

		outputColor = vec4(texel.rgb * l, l);

	#else

		outputColor = vec4(l);

	#endif

}
