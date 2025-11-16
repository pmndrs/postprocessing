vec4 blend(const in vec4 dst, const in vec4 src, const in float opacity) {

	vec3 a = 2.0 * src.rgb * dst.rgb;
	vec3 b = 1.0 - 2.0 * (1.0 - src.rgb) * (1.0 - dst.rgb);
	vec3 c = mix(a, b, step(0.5, dst.rgb));
	return mix(dst, vec4(c, max(dst.a, src.a)), opacity);

}
