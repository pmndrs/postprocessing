vec3 blend(const in vec3 x, const in vec3 y, const in float opacity) {

	return min(x + y, 1.0) * opacity + x * (1.0 - opacity);

}
