vec4 blend(const in vec4 x, const in vec4 y, const in float opacity) {

	return mix(x, vec4(x.rgb / max(y.rgb, 1e-12), y.a), opacity);

}
