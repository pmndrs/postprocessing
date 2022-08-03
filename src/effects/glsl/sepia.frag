uniform vec3 weightsR;
uniform vec3 weightsG;
uniform vec3 weightsB;

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {

	vec3 color = vec3(
		dot(inputColor.rgb, weightsR),
		dot(inputColor.rgb, weightsG),
		dot(inputColor.rgb, weightsB)
	);

	outputColor = vec4(color, inputColor.a);

}
