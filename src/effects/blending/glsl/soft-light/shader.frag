float blend(const in float x, const in float y) {

	return (y < 0.5) ?
		(2.0 * x * y + x * x * (1.0 - 2.0 * y)) :
		(sqrt(x) * (2.0 * y - 1.0) + 2.0 * x * (1.0 - y));

}

vec3 blend(const in vec3 x, const in vec3 y, const in float opacity) {

	vec3 z = vec3(blend(x.r, y.r), blend(x.g, y.g), blend(x.b, y.b));

	return z * opacity + x * (1.0 - opacity);

}

vec4 blend(const in vec4 x, const in vec4 y, const in float opacity) {

	return vec4(blend(x.rgb, y.rgb, opacity), y.a);

}
