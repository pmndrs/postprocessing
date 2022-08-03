vec4 blend(const in vec4 x, const in vec4 y, const in float opacity) {

	vec4 z = mix(
		max(1.0 - min((1.0 - x) / (2.0 * y), 1.0), 0.0),
		min(x / (2.0 * (1.0 - y)), 1.0),
		step(0.5, y)
	);

	return mix(x, z, opacity);

}
