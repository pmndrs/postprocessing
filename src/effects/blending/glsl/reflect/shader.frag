float blend(const in float x, const in float y) {

	return (y == 1.0) ? y : min(x * x / (1.0 - y), 1.0);

}

vec3 blend(const in vec3 x, const in vec3 y, const in float opacity) {

	vec3 z = vec3(blend(x.r, y.r), blend(x.g, y.g), blend(x.b, y.b));

	return z * opacity + x * (1.0 - opacity);

}
