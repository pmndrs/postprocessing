vec4 blend(const in vec4 dst, const in vec4 src, const in float opacity) {

	return mix(dst, vec4(dst.rgb / max(src.rgb, 1e-12), src.a), src.a * opacity);

}
