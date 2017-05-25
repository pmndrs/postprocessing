uniform sampler2D texture1;
uniform sampler2D texture2;

uniform float opacity1;
uniform float opacity2;

varying vec2 vUv;

void main() {

	vec4 texel1 = opacity1 * texture2D(texture1, vUv);
	vec4 texel2 = opacity2 * texture2D(texture2, vUv);

	#ifdef SCREEN_MODE

		vec3 invTexel1 = vec3(1.0) - texel1.rgb;
		vec3 invTexel2 = vec3(1.0) - texel2.rgb;

		vec4 color = vec4(
			vec3(1.0) - invTexel1 * invTexel2,
			texel1.a + texel2.a
		);

	#else

		vec4 color = texel1 + texel2;

	#endif

	gl_FragColor = color;

}
