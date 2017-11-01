#include <common>

// https://en.wikipedia.org/wiki/Relative_luminance
float linearToRelativeLuminance(const in vec3 color) {

	vec3 weights = vec3(0.2126, 0.7152, 0.0722);

	return dot(weights, color.rgb);

}

uniform sampler2D tDiffuse;
uniform float distinction;
uniform vec2 range;

varying vec2 vUv;

void main() {

	vec4 texel = texture2D(tDiffuse, vUv);
	float l = linearToRelativeLuminance(texel.rgb);

	#ifdef RANGE

		float low = step(range.x, l);
		float high = step(l, range.y);

		// Apply the mask.
		l *= low * high;

	#endif

	l = pow(abs(l), distinction);

	#ifdef COLOR

		gl_FragColor = vec4(texel.rgb * l, texel.a);

	#else

		gl_FragColor = vec4(l, l, l, texel.a);

	#endif

}
