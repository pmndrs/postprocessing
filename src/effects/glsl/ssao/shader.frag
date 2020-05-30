uniform sampler2D aoBuffer;

uniform float luminanceInfluence;

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {

	float ao = texture2D(aoBuffer, uv).r;

	// Fade AO based on luminance.
	float l = linearToRelativeLuminance(inputColor.rgb);
	ao = mix(ao, 1.0, l * luminanceInfluence);

	outputColor = vec4(vec3(ao), inputColor.a);

}
