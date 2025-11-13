vec4 blend(const in vec4 dst, const in vec4 src, const in float opacity) {

	vec3 c = mix(
		max(1.0 - min((1.0 - dst.rgb) / (2.0 * src.rgb), 1.0), 0.0),
		min(dst.rgb / (2.0 * (1.0 - src.rgb)), 1.0),
		step(0.5, src.rgb)
	);

	return mix(dst, vec4(c, src.a), src.a * opacity);

}
