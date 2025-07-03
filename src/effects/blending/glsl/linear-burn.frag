vec4 blend(const in vec4 x, const in vec4 y, const in float opacity) {

	return mix(x, vec4(clamp(y.rgb + x.rgb - 1.0, 0.0, 1.0), y.a), opacity);

}
