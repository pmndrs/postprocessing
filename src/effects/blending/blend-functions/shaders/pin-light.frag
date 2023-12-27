vec4 blend(const in vec4 x, const in vec4 y, const in float opacity) {

	vec4 y2 = 2.0 * y;

	vec4 z = mix(
		mix(y2, x, step(0.5 * x, y)),
		max(y2 - 1.0, vec4(0.0)), 
		step(x, y2 - 1.0)
	);

	return mix(x, z, opacity);

}
