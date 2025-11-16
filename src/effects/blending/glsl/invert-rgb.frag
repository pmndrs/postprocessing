vec4 blend(const in vec4 dst, const in vec4 src, const in float opacity) {

	vec3 c = src.rgb * max(1.0 - dst.rgb, 0.0);
	return mix(dst, vec4(c, max(dst.a, src.a)), opacity);

}
