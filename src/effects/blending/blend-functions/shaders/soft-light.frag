vec4 blend(const in vec4 dst, const in vec4 src, const in float opacity) {

	vec3 a = dst.rgb;
	vec3 b = src.rgb;

	vec3 src2 = 2.0 * b;
	vec3 w = step(0.5, b);

	vec3 c = a - (1.0 - src2) * a * (1.0 - a);
	vec3 d = mix(
		a + (src2 - 1.0) * (sqrt(a) - a),
		a + (src2 - 1.0) * a * ((16.0 * a - 12.0) * a + 3.0),
		w * (1.0 - step(0.25, a))
	);

	vec3 e = mix(c, d, w);
	return mix(dst, vec4(e, src.a), src.a * opacity);

}
