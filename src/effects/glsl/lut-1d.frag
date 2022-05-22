#ifdef LUT_PRECISION_HIGH

	#ifdef GL_FRAGMENT_PRECISION_HIGH

		uniform highp sampler2D lut;

	#else

		uniform mediump sampler2D lut;

	#endif

#else

	uniform lowp sampler2D lut;

#endif

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {

	outputColor = vec4(
		texture2D(lut, vec2(inputColor.r, 0.5)).r,
		texture2D(lut, vec2(inputColor.g, 0.5)).r,
		texture2D(lut, vec2(inputColor.b, 0.5)).r,
		inputColor.a
	);

}
