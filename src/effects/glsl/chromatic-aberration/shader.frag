varying vec2 vUvR;
varying vec2 vUvB;

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {

	vec4 color = inputColor;

	color.r = texture2D(inputBuffer, vUvR).r;
	color.b = texture2D(inputBuffer, vUvB).b;

	outputColor = color;

}
