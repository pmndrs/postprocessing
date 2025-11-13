vec4 blend(const in vec4 dst, const in vec4 src, const in float opacity) {

	vec3 a = min(dst.rgb * dst.rgb / max(1.0 - src.rgb, 1e-12), 1.0);
	vec3 c = mix(a, src.rgb, step(1.0, src.rgb));
	return mix(dst, vec4(c, src.a), src.a * opacity);

}
