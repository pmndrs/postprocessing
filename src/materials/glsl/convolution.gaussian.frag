#ifdef FRAMEBUFFER_PRECISION_HIGH

	uniform mediump sampler2D inputBuffer;

#else

	uniform lowp sampler2D inputBuffer;

#endif

varying vec2 vOffset;
varying vec2 vUv;

// gOffsets and gWeights will be injected as const arrays.

void main() {

	vec4 result = texture2D(inputBuffer, vUv) * gWeights[0];

	for(int i = 1; i < STEPS; ++i) {

		vec2 offset = gOffsets[i] * vOffset;
		vec4 c0 = texture2D(inputBuffer, vUv + offset);
		vec4 c1 = texture2D(inputBuffer, vUv - offset);
		result += (c0 + c1) * gWeights[i];

	}

	gl_FragColor = result;
	#include <encodings_fragment>

}
