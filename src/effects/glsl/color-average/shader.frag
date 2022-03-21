void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {

	outputColor = vec4(average(inputColor.rgb), inputColor.a);

}
