#ifdef FRAMEBUFFER_PRECISION_HIGH

	uniform mediump sampler2D inputBuffer;

#else

	uniform lowp sampler2D inputBuffer;

#endif

uniform vec2 kernel[STEPS];

varying vec2 vOffset;
varying vec2 vUv;

void main() {

	vec4 result = texture2D(inputBuffer, vUv) * kernel[0].y;

	for(int i = 1; i < STEPS; ++i) {

		vec2 offset = kernel[i].x * vOffset;
		vec4 c0 = texture2D(inputBuffer, vUv + offset);
		vec4 c1 = texture2D(inputBuffer, vUv - offset);
		result += (c0 + c1) * kernel[i].y;

	}

	gl_FragColor = result;

	#include <colorspace_fragment>

}
