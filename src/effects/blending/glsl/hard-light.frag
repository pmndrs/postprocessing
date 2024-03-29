vec4 blend(const in vec4 x, const in vec4 y, const in float opacity) {

	vec4 a = min(x, 1.0), b = min(y, 1.0);
	vec4 z = mix(2.0 * a * b, 1.0 - 2.0 * (1.0 - a) * (1.0 - b), step(0.5, y));
	return mix(x, z, opacity);

}
