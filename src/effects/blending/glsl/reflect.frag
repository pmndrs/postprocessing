float blend(const in float x, const in float y) {

	return (y >= 1.0) ? y : min(x * x / max(1.0 - y, 1e-9), 1.0);

}

vec4 blend(const in vec4 x, const in vec4 y, const in float opacity) {

	vec4 z = vec4(
		blend(x.r, y.r),
		blend(x.g, y.g),
		blend(x.b, y.b),
		blend(x.a, y.a)
	);

	return mix(x, z, opacity);

}
