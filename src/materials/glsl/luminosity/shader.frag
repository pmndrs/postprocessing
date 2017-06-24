uniform sampler2D tDiffuse;
uniform float distinction;
uniform vec2 range;
uniform vec3 luminanceCoefficients;

varying vec2 vUv;

void main() {

	vec4 texel = texture2D(tDiffuse, vUv);
	float v = dot(texel.rgb, luminanceCoefficients);

	#ifdef RANGE

		float low = step(range.x, v);
		float high = step(v, range.y);

		// Apply the mask.
		v *= low * high;

	#endif

	v = pow(abs(v), distinction);

	#ifdef COLOR

		gl_FragColor = vec4(texel.rgb * v, texel.a);

	#else

		gl_FragColor = vec4(v, v, v, texel.a);

	#endif

}
