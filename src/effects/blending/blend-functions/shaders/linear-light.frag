vec4 blend(const in vec4 dst, const in vec4 src, const in float opacity) {

	return mix(dst, vec4(clamp(2.0 * src.rgb + dst.rgb - 1.0, 0.0, 1.0), src.a), src.a * opacity);

}
