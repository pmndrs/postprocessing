uniform vec2 angle;
uniform float scale;
uniform float intensity;

float pattern(const in vec2 uv) {

	vec2 point = vec2(dot(angle.yx, vec2(uv.x, -uv.y)), dot(angle, uv)) * scale;

	return (sin(point.x) * sin(point.y)) * 4.0;

}

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {

	vec3 color = vec3(inputColor.rgb * 10.0 - 5.0 + pattern());
	color = inputColor.rgb + (color - inputColor.rgb) * intensity;

	outputColor = vec4(color, inputColor.a);

}
