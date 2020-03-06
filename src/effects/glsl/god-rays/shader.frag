uniform sampler2D texture;

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {

	outputColor = texture2D(texture, uv);

}
