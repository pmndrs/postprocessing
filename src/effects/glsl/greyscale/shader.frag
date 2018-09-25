void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {

	outputColor = vec4(vec3(linearToRelativeLuminance(inputColor.rgb)), inputColor.a);

}
