#include <common>

#ifdef FRAMEBUFFER_PRECISION_HIGH

	uniform mediump sampler2D inputBuffer;

#else

	uniform lowp sampler2D inputBuffer;

#endif

#ifdef THRESHOLD

	uniform float threshold;
	uniform float smoothing;

#endif

varying vec2 vUv;

void main() {

	vec4 texel = texture2D(inputBuffer, vUv);
	float l = luminance(texel.rgb);

	#ifdef THRESHOLD

		l = smoothstep(threshold, threshold + smoothing, l);

	#endif

	#ifdef COLOR

		gl_FragColor = vec4(texel.rgb * l, l);

	#else

		gl_FragColor = vec4(l);

	#endif

}
