vec4 blend(const in vec4 x, const in vec4 y, const in float opacity) {

	vec4 z = (x < 1.0) ? (step(0.0, y) * (1.0 - min(vec4(1.0), (1.0 - x) / y))), vec4(1.0);
	return mix(x, z, opacity);

}
