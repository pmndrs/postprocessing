#ifdef FRAMEBUFFER_PRECISION_HIGH

	uniform mediump sampler2D inputBuffer;

#else

	uniform lowp sampler2D inputBuffer;

#endif

// (1 / 4) * 0.5 = 0.125
#define WEIGHT_INNER 0.125
// (1 / 9) * 0.5 = 0.0555555
#define WEIGHT_OUTER 0.0555555

varying vec2 vUv;
varying vec2 vUv00;
varying vec2 vUv01;
varying vec2 vUv02;
varying vec2 vUv03;
varying vec2 vUv04;
varying vec2 vUv05;
varying vec2 vUv06;
varying vec2 vUv07;
varying vec2 vUv08;
varying vec2 vUv09;
varying vec2 vUv10;
varying vec2 vUv11;

float clampToBorder(const in vec2 uv) {

	// (uv.s < 0.0 || uv.s > 1.0 || uv.t < 0.0 || uv.t > 1.0) ? 0.0 : 1.0;
	vec2 s = step(vec2(0.0), uv) * step(uv, vec2(1.0));
	return s.x * s.y;

}

void main() {

	vec4 c = vec4(0.0);
	float d = 1.0;

	vec4 w = WEIGHT_INNER * vec4(
		clampToBorder(vUv00),
		clampToBorder(vUv01),
		clampToBorder(vUv02),
		clampToBorder(vUv03)
	);

	d -= dot(w, vec4(1.0));
	c += w.x * texture2D(inputBuffer, vUv00);
	c += w.y * texture2D(inputBuffer, vUv01);
	c += w.z * texture2D(inputBuffer, vUv02);
	c += w.w * texture2D(inputBuffer, vUv03);

	w = WEIGHT_OUTER * vec4(
		clampToBorder(vUv04),
		clampToBorder(vUv05),
		clampToBorder(vUv06),
		clampToBorder(vUv07)
	);

	d -= dot(w, vec4(1.0));
	c += w.x * texture2D(inputBuffer, vUv04);
	c += w.y * texture2D(inputBuffer, vUv05);
	c += w.z * texture2D(inputBuffer, vUv06);
	c += w.w * texture2D(inputBuffer, vUv07);

	w = WEIGHT_OUTER * vec4(
		clampToBorder(vUv08),
		clampToBorder(vUv09),
		clampToBorder(vUv10),
		clampToBorder(vUv11)
	);

	d -= dot(w, vec4(1.0));
	c += w.x * texture2D(inputBuffer, vUv08);
	c += w.y * texture2D(inputBuffer, vUv09);
	c += w.z * texture2D(inputBuffer, vUv10);
	c += w.w * texture2D(inputBuffer, vUv11);

	c += texture2D(inputBuffer, vUv) * d;
	gl_FragColor = c;

	#include <encodings_fragment>

}
