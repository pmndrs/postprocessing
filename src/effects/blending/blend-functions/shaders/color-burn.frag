vec4 blend(const in vec4 x, const in vec4 y, const in float opacity) {

	vec3 a = x.rgb, b = y.rgb;
	vec3 z = mix(step(0.0, b) * (1.0 - min(vec3(1.0), (1.0 - a) / b)), vec3(1.0), step(1.0, a));
	return mix(x, vec4(z, y.a), opacity);

}
