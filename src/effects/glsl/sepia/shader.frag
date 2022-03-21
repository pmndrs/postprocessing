uniform float intensity;

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {

	vec3 color = vec3(
		dot(inputColor.rgb, vec3(1.0, 0.0, 0.0) + vec3(-0.607, 0.769, 0.189) * intensity),
		dot(inputColor.rgb, vec3(0.0, 1.0, 0.0) + vec3(0.349, -0.314, 0.168) * intensity),
		dot(inputColor.rgb, vec3(0.0, 0.0, 1.0) + vec3(0.272, 0.534, -0.869) * intensity)
	);

	outputColor = vec4(color, inputColor.a);

}
