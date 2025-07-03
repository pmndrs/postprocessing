vec4 blend(const in vec4 x, const in vec4 y, const in float opacity) {

	return mix(x, vec4(x.rgb + y.rgb - min(x.rgb * y.rgb, 1.0), y.a), opacity);

}
