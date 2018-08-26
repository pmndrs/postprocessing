uniform vec2 scale;
uniform float lineWidth;
uniform float intensity;

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {

	float grid = 0.5 - max(abs(mod(uv.x * scale.x, 1.0) - 0.5), abs(mod(uv.y * scale.y, 1.0) - 0.5));
	color *= (1.0 - intensity) + vec3(smoothstep(0.0, lineWidth, grid)) * intensity;

	outputColor = vec4(color, 1.0);

}
