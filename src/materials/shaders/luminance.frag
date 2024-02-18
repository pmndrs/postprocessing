#include <pp_precision_fragment>

#include <common>

#include <pp_default_output_pars_fragment>
#include <pp_input_buffer_pars_fragment>

#ifdef THRESHOLD

	uniform float threshold;
	uniform float smoothing;

#endif

in vec2 vUv;

void main() {

	vec4 texel = texture(inputBuffer, vUv);
	float l = luminance(texel.rgb);

	#ifdef THRESHOLD

		l = smoothstep(threshold, threshold + smoothing, l) * l;

	#endif

	#ifdef COLOR

		out_Color = vec4(texel.rgb * clamp(l, 0.0, 1.0), l);

	#else

		out_Color = vec4(l);

	#endif

}
