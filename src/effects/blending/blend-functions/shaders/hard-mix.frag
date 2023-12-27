vec4 blend(const in vec4 x, const in vec4 y, const in float opacity) {

	return mix(x, step(1.0, x + y), opacity);

}
