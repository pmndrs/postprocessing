#ifdef FRAMEBUFFER_PRECISION_HIGH

	uniform mediump sampler2D map;

#else

	uniform lowp sampler2D map;

#endif

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {

	outputColor = texture2D(map, uv);

}
