vec4 blend(const in vec4 x, const in vec4 y, const in float opacity) {

	vec3 a = min(x.rgb, 1.0);
	vec3 b = min(y.rgb, 1.0);
	vec3 z = mix(2.0 * a * b, 1.0 - 2.0 * (1.0 - a) * (1.0 - b), step(0.5, b));
	return mix(x, vec4(z, y.a), opacity);

}
