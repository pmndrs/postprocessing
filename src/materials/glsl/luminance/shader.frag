#include <common>

uniform sampler2D inputBuffer;
uniform float distinction;
uniform vec2 range;

varying vec2 vUv;

void main() {

	vec4 texel = texture2D(inputBuffer, vUv);
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
