#ifdef FRAMEBUFFER_PRECISION_HIGH

	uniform mediump sampler2D inputBuffer;

#else

	uniform lowp sampler2D inputBuffer;

#endif

uniform vec2 texelSize;
uniform vec3 kernel[SAMPLES];

varying vec2 vUv;

void main() {

	vec4 c = vec4(0.0);

	for(int i = 0; i < SAMPLES; ++i) {

		vec2 uv = vUv + kernel[i].xy * texelSize;
		c += kernel[i].z * texture2D(inputBuffer, uv);

	}

	gl_FragColor = c;

	#include <encodings_fragment>

}
