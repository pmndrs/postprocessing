vec4 blend(const in vec4 x, const in vec4 y, const in float opacity) {

	vec3 a = x.rgb;
	vec3 b = y.rgb;

	vec3 y2 = 2.0 * b;
	vec3 w = step(0.5, b);

	vec3 c = a - (1.0 - y2) * a * (1.0 - a);
	vec3 d = mix(
		a + (y2 - 1.0) * (sqrt(a) - a),
		a + (y2 - 1.0) * a * ((16.0 * a - 12.0) * a + 3.0),
		w * (1.0 - step(0.25, a))
	);

	vec3 z = mix(c, d, w);

	return mix(x, vec4(z, y.a), opacity);

}
