vec4 blend(const in vec4 x, const in vec4 y, const in float opacity) {

	return mix(x, mix(min(x * x / max(1.0 - y, 1e-12), 1.0), y, step(1.0, y)), opacity);

}
