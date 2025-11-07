vec4 blend(const in vec4 x, const in vec4 y, const in float opacity) {

	return mix(x, y, y.a * opacity);

}
