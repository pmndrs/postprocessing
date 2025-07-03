vec4 blend(const in vec4 x, const in vec4 y, const in float opacity) {

	return mix(x, vec4(1.0 - abs(1.0 - x.rgb - y.rgb), y.a), opacity);

}
