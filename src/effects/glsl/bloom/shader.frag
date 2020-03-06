uniform sampler2D texture;
uniform float intensity;

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {

	outputColor = clamp(texture2D(texture, uv) * intensity, 0.0, 1.0);

}
