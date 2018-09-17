void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {

	float sum = inputColor.r + inputColor.g + inputColor.b;

	outputColor = vec4(vec3(sum / 3.0), inputColor.a);

}
