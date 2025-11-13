vec4 blend(const in vec4 dst, const in vec4 src, const in float opacity) {

	vec3 a = dst.rgb, b = src.rgb;
	vec3 c = step(0.0, a) * mix(min(vec3(1.0), a / max(1.0 - b, 1e-9)), vec3(1.0), step(1.0, b));
	return mix(dst, vec4(c, src.a), src.a * opacity);

}
