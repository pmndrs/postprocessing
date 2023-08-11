vec4 blend(const in vec4 x, const in vec4 y, const in float opacity) {

	return mix(x, x / max(y, 1e-12), opacity);

}
