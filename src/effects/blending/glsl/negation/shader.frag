vec3 blend(const in vec3 x, const in vec3 y, const in float opacity) {

	return (1.0 - abs(1.0 - x - y)) * opacity + x * (1.0 - opacity);

}
