uniform sampler2D texture1;
uniform sampler2D texture2;

uniform float opacity1;
uniform float opacity2;

varying vec2 vUv;

void main() {

	vec4 texel1 = texture2D(texture1, vUv);
	vec4 texel2 = texture2D(texture2, vUv);

	#ifdef INVERT_TEX1

		texel1.rgb = vec3(1.0) - texel1.rgb;

	#endif

	#ifdef INVERT_TEX2

		texel2.rgb = vec3(1.0) - texel2.rgb;

	#endif

	gl_FragColor = opacity1 * texel1 + opacity2 * texel2;

}
