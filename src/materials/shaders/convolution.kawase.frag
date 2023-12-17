#include <pp_precision_fragment>
#include <pp_default_output_pars_fragment>
#include <pp_input_buffer_pars_fragment>

in vec2 vUv0, vUv1, vUv2, vUv3;

void main() {

	vec4 sum = texture(inputBuffer, vUv0); // Top left
	sum += texture(inputBuffer, vUv1); // Top right
	sum += texture(inputBuffer, vUv2); // Bottom right
	sum += texture(inputBuffer, vUv3); // Bottom left
	outputColor = sum * 0.25; // Compute the average

}
