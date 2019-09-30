varying vec2 vUvR;
varying vec2 vUvB;

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {

	vec4 color = inputColor;

	#ifdef ALPHA

		vec2 ra = texture2D(inputBuffer, vUvR).ra;
		vec2 ba = texture2D(inputBuffer, vUvB).ba;

		color.r = ra.x;
		color.b = ba.x;
		color.a = max(max(ra.y, ba.y), inputColor.a);

	#else

		color.r = texture2D(inputBuffer, vUvR).r;
		color.b = texture2D(inputBuffer, vUvB).b;

	#endif

	outputColor = color;

}
