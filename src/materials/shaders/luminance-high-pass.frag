#include <common>
#include <pp_default_output_pars_fragment>
#include <pp_input_buffer_pars_fragment>

uniform float threshold;
uniform float smoothing;

in vec2 vUv;

void main() {

	vec4 texel = texture(inputBuffer, vUv);
	float l = luminance(texel.rgb);
	float mask = smoothstep(threshold, threshold + smoothing, l);

	out_Color = texel * mask;

}
