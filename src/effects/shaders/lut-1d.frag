#ifdef LUT_PRECISION_HIGH

	#ifdef GL_FRAGMENT_PRECISION_HIGH

		uniform highp sampler2D lut;

	#else

		uniform mediump sampler2D lut;

	#endif

#else

	uniform lowp sampler2D lut;

#endif

vec4 mainImage(const in vec4 inputColor, const in vec2 uv, const in GData gData) {

	return vec4(
		texture(lut, vec2(inputColor.r, 0.5)).r,
		texture(lut, vec2(inputColor.g, 0.5)).r,
		texture(lut, vec2(inputColor.b, 0.5)).r,
		inputColor.a
	);

}
