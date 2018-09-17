uniform float intensity;
uniform float count;

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {

	vec2 sl = vec2(sin(uv.y * count), cos(uv.y * count));
	vec3 scanlines = texel.rgb * vec3(sl.x, sl.y, sl.x) * intensity;

	outputColor = vec4(scanlines, 1.0);

}
