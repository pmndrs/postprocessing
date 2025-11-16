vec4 blend(const in vec4 dst, const in vec4 src, const in float opacity) {

	vec3 a = dst.rgb, b = src.rgb;
	vec3 c = mix(step(0.0, b) * (1.0 - min(vec3(1.0), (1.0 - a) / max(b, 1e-9))), vec3(1.0), step(1.0, a));
	return mix(dst, vec4(c, max(dst.a, src.a)), opacity);

}
