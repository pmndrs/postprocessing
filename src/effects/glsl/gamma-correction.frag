uniform float gamma;

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {

	outputColor = LinearToGamma(max(inputColor, 0.0), gamma);

}
