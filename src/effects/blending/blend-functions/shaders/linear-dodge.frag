vec4 blend(const in vec4 x, const in vec4 y, const in float opacity) {

	return mix(x, min(x + y, 1.0), opacity);

}
