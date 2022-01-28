#include <common>
#include <dithering_pars_fragment>

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

	// Sample top left texel.
	vec4 sum = texture2D(inputBuffer, vUv0);

	// Sample top right texel.
	sum += texture2D(inputBuffer, vUv1);

	// Sample bottom right texel.
	sum += texture2D(inputBuffer, vUv2);

	// Sample bottom left texel.
	sum += texture2D(inputBuffer, vUv3);

	// Compute the average.
	gl_FragColor = sum * 0.25;

	#include <encodings_fragment>
	#include <dithering_fragment>

}
