vec4 blend(const in vec4 dst, const in vec4 src, const in float opacity) {

	return mix(dst, vec4(1.0 - src.rgb, src.a), src.a * opacity);

}
