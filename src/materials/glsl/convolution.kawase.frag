#ifdef FRAMEBUFFER_PRECISION_HIGH

	uniform mediump sampler2D inputBuffer;

#else

	uniform lowp sampler2D inputBuffer;

#endif

varying vec2 vUv0;
varying vec2 vUv1;
varying vec2 vUv2;
varying vec2 vUv3;

void main() {

	vec4 sum = texture2D(inputBuffer, vUv0); // Top left
	sum += texture2D(inputBuffer, vUv1); // Top right
	sum += texture2D(inputBuffer, vUv2); // Bottom right
	sum += texture2D(inputBuffer, vUv3); // Bottom left
	gl_FragColor = sum * 0.25; // Compute the average

	#include <colorspace_fragment>

}
