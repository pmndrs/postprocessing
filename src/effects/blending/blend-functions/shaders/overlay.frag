vec4 blend(const in vec4 x, const in vec4 y, const in float opacity) {

	vec3 z = mix(2.0 * y.rgb * x.rgb, 1.0 - 2.0 * (1.0 - y.rgb) * (1.0 - x.rgb), step(0.5, x.rgb));
	return mix(x, vec4(z, y.a), opacity);

}
