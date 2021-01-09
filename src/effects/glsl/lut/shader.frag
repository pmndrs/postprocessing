#ifdef LUT_3D

	#ifdef LUT_PRECISION_HIGH

		#ifdef GL_FRAGMENT_PRECISION_HIGH

			uniform highp sampler3D lut;

		#else

			uniform mediump sampler3D lut;

		#endif

	#else

		uniform lowp sampler3D lut;

	#endif

	vec4 applyLUT(const in vec3 rgb) {

		return texture(lut, rgb);

	}

#else

	#ifdef LUT_PRECISION_HIGH

		#ifdef GL_FRAGMENT_PRECISION_HIGH

			uniform highp sampler2D lut;

		#else

			uniform mediump sampler2D lut;

		#endif

	#else

		uniform lowp sampler2D lut;

	#endif

	vec4 applyLUT(const in vec3 rgb) {

		// Get the slices on either side of the sample.
		float slice = rgb.b * LUT_SIZE;
		float interp = fract(slice);
		float slice0 = slice - interp;
		float centeredInterp = interp - 0.5;
		float slice1 = slice0 + sign(centeredInterp);

		#ifdef LUT_STRIP_HORIZONTAL

			// Pull X in by half a texel in each direction to avoid slice bleeding.
			float xOffset = clamp(
				rgb.r * LUT_TEXEL_HEIGHT,
				LUT_TEXEL_WIDTH * 0.5,
				LUT_TEXEL_HEIGHT - LUT_TEXEL_WIDTH * 0.5
			);

			vec2 uv0 = vec2(slice0 * LUT_TEXEL_HEIGHT + xOffset, rgb.g);
			vec2 uv1 = vec2(slice1 * LUT_TEXEL_HEIGHT + xOffset, rgb.g);

		#else

			// Pull Y in by half a texel in each direction to avoid slice bleeding.
			float yOffset = clamp(
				rgb.g * LUT_TEXEL_WIDTH,
				LUT_TEXEL_HEIGHT * 0.5,
				LUT_TEXEL_WIDTH - LUT_TEXEL_HEIGHT * 0.5
			);

			vec2 uv0 = vec2(rgb.r, slice0 * LUT_TEXEL_WIDTH + yOffset);
			vec2 uv1 = vec2(rgb.r, slice1 * LUT_TEXEL_WIDTH + yOffset);

		#endif

		vec4 sample0 = texture2D(lut, uv0);
		vec4 sample1 = texture2D(lut, uv1);

		return mix(sample0, sample1, abs(centeredInterp));

	}

#endif

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {

	vec3 c = linearToInputTexel(inputColor).rgb;

	#ifndef LUT_3D

		c = clamp(c, 0.0, 1.0);

	#endif

	// Apply scale/offset to prevent nonlinearities near the LUT's edges.
	c = texelToLinear(applyLUT(COORD_SCALE * c + COORD_OFFSET)).rgb;
	outputColor = vec4(c, inputColor.a);

}
