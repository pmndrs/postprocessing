#include <pp_precision_fragment>
#include <pp_default_output_pars_fragment>
#include <pp_input_buffer_pars_fragment>

in vec2 vUv0, vUv1, vUv2, vUv3, vUv4;

void main() {

	vec4 sum = texture(inputBuffer, vUv0) * 4.0;
	sum += texture(inputBuffer, vUv1);
	sum += texture(inputBuffer, vUv2);
	sum += texture(inputBuffer, vUv3);
	sum += texture(inputBuffer, vUv4);

	// Compute the average
	out_Color = sum / 8.0;

}
