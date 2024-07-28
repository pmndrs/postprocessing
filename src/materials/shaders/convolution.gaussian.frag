#include <pp_default_output_pars_fragment>
#include <pp_input_buffer_pars_fragment>

uniform vec2 kernel[STEPS];

in vec2 vOffset;
in vec2 vUv;

void main() {

	vec4 result = texture(inputBuffer, vUv) * kernel[0].y;

	for(int i = 1; i < STEPS; ++i) {

		vec2 offset = kernel[i].x * vOffset;
		vec4 c0 = texture(inputBuffer, vUv + offset);
		vec4 c1 = texture(inputBuffer, vUv - offset);
		result += (c0 + c1) * kernel[i].y;

	}

	out_Color = result;

}
