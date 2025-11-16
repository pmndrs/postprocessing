vec4 blend(const in vec4 dst, const in vec4 src, const in float opacity) {

	vec3 src2 = 2.0 * src.rgb;
	vec3 d = dst.rgb + (src2 - 1.0);
	vec3 w = step(0.5, src.rgb);
	vec3 a = dst.rgb - (1.0 - src2) * dst.rgb * (1.0 - dst.rgb);

	vec3 b = mix(
		d * (sqrt(dst.rgb) - dst.rgb),
		d * dst.rgb * ((16.0 * dst.rgb - 12.0) * dst.rgb + 3.0),
		w * (1.0 - step(0.25, dst.rgb))
	);

	vec3 c = mix(a, b, w);
	return mix(dst, vec4(c, max(dst.a, src.a)), opacity);

}
