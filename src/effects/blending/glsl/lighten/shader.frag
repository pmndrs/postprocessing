vec3 blend(const in vec3 x, const in vec3 y, const in float opacity) {

	return max(x, y) * opacity + x * (1.0 - opacity);

}

vec4 blend(const in vec4 x, const in vec4 y, const in float opacity) {

	return vec4(blend(x.rgb, y.rgb, opacity), y.a);

}
