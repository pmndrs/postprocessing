vec4 blend(const in vec4 x, const in vec4 y, const in float opacity) {

	vec3 y2 = 2.0 * y.rgb;

	vec3 z = mix(
		mix(y2, x.rgb, step(0.5 * x.rgb, y.rgb)),
		max(y2 - 1.0, vec3(0.0)), 
		step(x.rgb, y2 - 1.0)
	);

	return mix(x, vec4(z, y.a), opacity);

}
