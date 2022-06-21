vec4 blend(const in vec4 x, const in vec4 y, const in float opacity) {

	vec4 z = mix(
		max(vec4(0.0), 1.0 - min(vec4(1.0), (1.0 - x) / (2.0 * y))),
		min(vec4(1.0), x / (2.0 * (1.0 - y))),
		step(0.5, y)
	);

	return mix(x, z, opacity);

}
