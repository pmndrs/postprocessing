#include <pp_precision_fragment>
#include <pp_default_output_pars_fragment>
#include <pp_resolution_pars_fragment>
#include <pp_input_buffer_pars_fragment>

in vec2 vUv0, vUv1, vUv2, vUv3, vUv4, vUv5, vUv6, vUv7, vUv8;

void main() {

	vec4 sum = texture(inputBuffer, vUv0);
	sum += texture(inputBuffer, vUv1) * 2.0;
	sum += texture(inputBuffer, vUv2);
	sum += texture(inputBuffer, vUv3) * 2.0;
	sum += texture(inputBuffer, vUv4);
	sum += texture(inputBuffer, vUv5) * 2.0;
	sum += texture(inputBuffer, vUv6);
	sum += texture(inputBuffer, vUv7) * 2.0;

	// Compute the average
	out_Color = sum / 12.0;

}
