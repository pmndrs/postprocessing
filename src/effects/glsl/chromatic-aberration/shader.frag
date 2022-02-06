varying vec2 vUvR;
varying vec2 vUvB;

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {

	vec2 ra = texture2D(inputBuffer, vUvR).ra;
	vec2 ba = texture2D(inputBuffer, vUvB).ba;

	outputColor = vec4(ra.x, inputColor.g, ba.x, max(max(ra.y, ba.y), inputColor.a));

}
