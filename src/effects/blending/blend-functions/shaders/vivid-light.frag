vec4 blend(const in vec4 x, const in vec4 y, const in float opacity) {

	vec3 z = mix(
		max(1.0 - min((1.0 - x.rgb) / (2.0 * y.rgb), 1.0), 0.0),
		min(x.rgb / (2.0 * (1.0 - y.rgb)), 1.0),
		step(0.5, y.rgb)
	);

	return mix(x, vec4(z, y.a), opacity);

}
