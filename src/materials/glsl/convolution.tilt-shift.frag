#ifdef FRAMEBUFFER_PRECISION_HIGH

	uniform mediump sampler2D inputBuffer;

#else

	uniform lowp sampler2D inputBuffer;

#endif

uniform vec4 maskParams;

varying vec2 vUv;
varying vec2 vUv2;
varying vec2 vOffset;

float linearGradientMask(const in float x) {

	return smoothstep(maskParams.x, maskParams.y, x) -
		smoothstep(maskParams.w, maskParams.z, x);

}

void main() {

	vec2 dUv = vOffset * (1.0 - linearGradientMask(vUv2.y));
	vec4 sum = texture2D(inputBuffer, vec2(vUv.x - dUv.x, vUv.y + dUv.y)); // Top left
	sum += texture2D(inputBuffer, vec2(vUv.x + dUv.x, vUv.y + dUv.y)); // Top right
	sum += texture2D(inputBuffer, vec2(vUv.x + dUv.x, vUv.y - dUv.y)); // Bottom right
	sum += texture2D(inputBuffer, vec2(vUv.x - dUv.x, vUv.y - dUv.y)); // Bottom left
	gl_FragColor = sum * 0.25; // Compute the average

	#include <colorspace_fragment>

}
