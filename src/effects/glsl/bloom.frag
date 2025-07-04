#ifdef FRAMEBUFFER_PRECISION_HIGH

	uniform mediump sampler2D map;

#else

	uniform lowp sampler2D map;

#endif

uniform float intensity;

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {

	vec4 texel = texture2D(map, uv);
	outputColor = vec4(texel.rgb * intensity, max(inputColor.a, texel.a));

}
