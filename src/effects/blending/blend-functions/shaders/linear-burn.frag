vec4 blend(const in vec4 dst, const in vec4 src, const in float opacity) {

	vec3 c = clamp(src.rgb + dst.rgb - 1.0, 0.0, 1.0);
	return mix(dst, vec4(c, max(dst.a, src.a)), opacity);

}
