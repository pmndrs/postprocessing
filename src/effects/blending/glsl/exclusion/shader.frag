vec3 blend(const in vec3 x, const in vec3 y, const in float opacity) {

	return (x + y - 2.0 * x * y) * opacity + x * (1.0 - opacity);

}
