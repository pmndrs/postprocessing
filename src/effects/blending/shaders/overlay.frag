vec4 blend(const in vec4 x, const in vec4 y, const in float opacity) {

	vec4 z = (x < 0.5) ? (2.0 * y * x) : (1.0 - 2.0 * (1.0 - y) * (1.0 - x));
	return mix(x, z, opacity);

}
