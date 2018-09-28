uniform vec3 hue;
uniform float saturation;

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {

	// Hue.
	vec3 color = vec3(
		dot(inputColor.rgb, hue.xyz),
		dot(inputColor.rgb, hue.zxy),
		dot(inputColor.rgb, hue.yzx)
	);

	// Saturation.
	float average = (color.r + color.g + color.b) / 3.0;
	vec3 diff = average - color;

	if(saturation > 0.0) {

		color += diff * (1.0 - 1.0 / (1.001 - saturation));

	} else {

		color += diff * -saturation;

	}

	outputColor = vec4(min(color, 1.0), inputColor.a);

}
