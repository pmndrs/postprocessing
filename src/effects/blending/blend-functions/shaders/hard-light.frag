vec4 blend(const in vec4 dst, const in vec4 src, const in float opacity) {

	vec3 a = min(dst.rgb, 1.0);
	vec3 b = min(src.rgb, 1.0);
	vec3 c = mix(2.0 * a * b, 1.0 - 2.0 * (1.0 - a) * (1.0 - b), step(0.5, b));
	return mix(dst, vec4(c, src.a), src.a * opacity);

}
