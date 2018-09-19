uniform bool active;
uniform vec2 offset;

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {

	vec4 color = inputColor;

	if(active) {

		color.r = texture2D(inputBuffer, uv + offset).r;
		color.b = texture2D(inputBuffer, uv - offset).b;

	}

	outputColor = color;

}
