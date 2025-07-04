#ifdef FRAMEBUFFER_PRECISION_HIGH

	uniform mediump sampler2D map;

#else

	uniform lowp sampler2D map;

#endif

uniform float intensity;

vec4 mainImage(const in vec4 inputColor, const in vec2 uv, const in GData gData) {

	vec4 texel = texture(map, uv);
	return vec4(texel.rgb * intensity, max(inputColor.a, texel.a));

}
