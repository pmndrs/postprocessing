#include <pp_precision_fragment>
#include <pp_default_output_pars_fragment>
#include <pp_input_buffer_pars_fragment>

uniform vec4 maskParams;

in vec2 vUv;
in vec2 vUv2;
in vec2 vOffset;

float linearGradientMask(const in float x) {

	return smoothstep(maskParams.x, maskParams.y, x) - smoothstep(maskParams.w, maskParams.z, x);

}

void main() {

	vec2 dUv = vOffset * (1.0 - linearGradientMask(vUv2.y));
	vec4 sum = texture(inputBuffer, vec2(vUv.x - dUv.x, vUv.y + dUv.y)); // Top left
	sum += texture(inputBuffer, vec2(vUv.x + dUv.x, vUv.y + dUv.y)); // Top right
	sum += texture(inputBuffer, vec2(vUv.x + dUv.x, vUv.y - dUv.y)); // Bottom right
	sum += texture(inputBuffer, vec2(vUv.x - dUv.x, vUv.y - dUv.y)); // Bottom left
	out_Color = sum * 0.25; // Compute the average

}
