#include <pp_default_output_pars_fragment>
#include <pp_input_buffer_pars_fragment>

// (1 / 4) * 0.5 = 0.125
#define WEIGHT_INNER 0.125
// (1 / 9) * 0.5 = 0.0555555
#define WEIGHT_OUTER 0.0555555

in vec2 vUv;
in vec2 vUv00, vUv01, vUv02, vUv03;
in vec2 vUv04, vUv05, vUv06, vUv07;
in vec2 vUv08, vUv09, vUv10, vUv11;

float clampToBorder(const in vec2 uv) {

	#ifdef CLAMP_TO_BORDER

		return float(uv.s >= 0.0 && uv.s <= 1.0 && uv.t >= 0.0 && uv.t <= 1.0);

	#else

		return 1.0;

	#endif

}

void main() {

	vec4 c = vec4(0.0);

	vec4 w = WEIGHT_INNER * vec4(
		clampToBorder(vUv00),
		clampToBorder(vUv01),
		clampToBorder(vUv02),
		clampToBorder(vUv03)
	);

	c += w.x * texture(inputBuffer, vUv00);
	c += w.y * texture(inputBuffer, vUv01);
	c += w.z * texture(inputBuffer, vUv02);
	c += w.w * texture(inputBuffer, vUv03);

	w = WEIGHT_OUTER * vec4(
		clampToBorder(vUv04),
		clampToBorder(vUv05),
		clampToBorder(vUv06),
		clampToBorder(vUv07)
	);

	c += w.x * texture(inputBuffer, vUv04);
	c += w.y * texture(inputBuffer, vUv05);
	c += w.z * texture(inputBuffer, vUv06);
	c += w.w * texture(inputBuffer, vUv07);

	w = WEIGHT_OUTER * vec4(
		clampToBorder(vUv08),
		clampToBorder(vUv09),
		clampToBorder(vUv10),
		clampToBorder(vUv11)
	);

	c += w.x * texture(inputBuffer, vUv08);
	c += w.y * texture(inputBuffer, vUv09);
	c += w.z * texture(inputBuffer, vUv10);
	c += w.w * texture(inputBuffer, vUv11);

	c += WEIGHT_OUTER * texture(inputBuffer, vUv);
	out_Color = c;

}
