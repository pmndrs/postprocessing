vec4 blend(const in vec4 x, const in vec4 y, const in float opacity) {

	return mix(x, vec4(min(x.rgb, y.rgb), y.a), opacity);

}
