vec4 blend(const in vec4 x, const in vec4 y, const in float opacity) {

	vec4 a = (y < 1.0) ? min(x / (1.0 - y), vec4(1.0)) : vec4(1.0);
	vec4 z = step(0.0, x) * a;
	return mix(x, z, opacity);

}
