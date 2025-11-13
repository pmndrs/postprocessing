vec4 blend(const in vec4 dst, const in vec4 src, const in float opacity) {

	return mix(dst, vec4((dst.rgb + src.rgb) * 0.5, src.a), src.a * opacity);

}
