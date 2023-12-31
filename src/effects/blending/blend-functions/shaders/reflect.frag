vec4 blend(const in vec4 x, const in vec4 y, const in float opacity) {

	vec3 z = mix(min(x.rgb * x.rgb / max(1.0 - y.rgb, 1e-12), 1.0), y.rgb, step(1.0, y.rgb));
	return mix(x, vec4(z, y.a), opacity);

}
