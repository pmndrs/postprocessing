#ifdef FRAMEBUFFER_PRECISION_HIGH

	uniform mediump sampler2D inputBuffer;

#else

	uniform lowp sampler2D inputBuffer;

#endif

uniform float opacity;

varying vec2 vUv;

void main() {

	vec4 texel = texture2D(inputBuffer, vUv);
	gl_FragColor = opacity * texel;

	#include <encodings_fragment>

}
