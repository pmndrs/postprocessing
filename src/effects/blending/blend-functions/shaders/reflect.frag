vec4 blend(const in vec4 x, const in vec4 y, const in float opacity) {

	vec4 z = (y < 1.0) ? min(x * x / max(1.0 - y, 1e-12), 1.0) : y;
	return mix(x, z, opacity);

}
