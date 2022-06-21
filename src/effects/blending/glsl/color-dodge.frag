vec4 blend(const in vec4 x, const in vec4 y, const in float opacity) {

	vec4 z = step(0.0, x) * mix(min(vec4(1.0), x / max(1.0 - y, 1e-9)), vec4(1.0), step(1.0, y));
	return mix(x, z, opacity);

}
