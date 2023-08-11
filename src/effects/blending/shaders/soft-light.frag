vec4 blend(const in vec4 x, const in vec4 y, const in float opacity) {

	vec4 y2 = 2.0 * y;

	vec4 z = (y < 0.5) ?
		(x - (1.0 - y2) * x * (1.0 - x)) : 
		mix(
			x + (y2 - 1.0) * (sqrt(x) - x),
			x + (y2 - 1.0) * x * ((16.0 * x - 12.0) * x + 3.0),
			step(0.5, y) * (1.0 - step(0.25, x))
		);

	return mix(x, z, opacity);

}
