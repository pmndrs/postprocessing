#include <common>

uniform sampler2D inputBuffer;
uniform vec2 range;
uniform float threshold;
uniform float smoothWidth;

varying vec2 vUv;

void main() {

	vec4 texel = texture2D(inputBuffer, vUv);
	float l = linearToRelativeLuminance(texel.rgb);

	#ifdef RANGE

		// Apply a luminance range mask.
		float low = step(range.x, l);
		float high = step(l, range.y);

		l *= low * high;

	#else

		l = smoothstep(threshold, threshold + smoothWidth, l);

	#endif

	#ifdef COLOR

		gl_FragColor = vec4(texel.rgb * l, l);

	#else

		gl_FragColor = vec4(l);

	#endif

}
