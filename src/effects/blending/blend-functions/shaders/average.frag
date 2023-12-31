vec4 blend(const in vec4 x, const in vec4 y, const in float opacity) {

	return mix(x, vec4((x.rgb + y.rgb) * 0.5, y.a), opacity);

}
