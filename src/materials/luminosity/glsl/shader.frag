uniform sampler2D tDiffuse;
uniform float distinction;
uniform vec2 range;

varying vec2 vUv;

const vec4 LUM_COEFF = vec4(0.299, 0.587, 0.114, 0.0);

void main() {

	vec4 texel = texture2D(tDiffuse, vUv);
	float v = dot(texel, LUM_COEFF);

	#ifdef RANGE

		float low = step(range.x, v);
		float high = step(v, range.y);

		// Apply the mask.
		v *= low * high;

	#endif

	v = pow(v, distinction);

	#ifdef COLOR

		gl_FragColor = vec4(texel.rgb * v, texel.a);

	#else

		gl_FragColor = vec4(v, v, v, texel.a);

	#endif

}
