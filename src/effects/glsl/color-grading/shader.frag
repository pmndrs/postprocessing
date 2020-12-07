#ifdef LUT_3D

	#if defined(LUT_HIGH_PRECISION) && defined(GL_FRAGMENT_PRECISION_HIGH)

		uniform highp sampler3D lut;

	#else

		uniform lowp sampler3D lut;

	#endif

#else

	#if defined(LUT_HIGH_PRECISION) && defined(GL_FRAGMENT_PRECISION_HIGH)

		uniform highp sampler2D lut;

	#else

		uniform lowp sampler2D lut;

	#endif

#endif

#ifdef LUT_3D

	vec3 applyLUT(vec3 rgb) {

		return texture(lut, rgb).rgb;

	}

#else

	vec3 applyLUT(vec3 rgb) {

		// Prevent interpolation artifacts between adjacent slices.
		rgb.xy = clamp(rgb.xy, LUT_HALF_TEXEL_SIZE, 1.0 - LUT_HALF_TEXEL_SIZE);

		// Prepare the X- and Y-position.
		float yOffset = rgb.y * INV_LUT_SIZE;
		vec2 uv1 = vec2(rgb.x, yOffset);
		vec2 uv2 = vec2(rgb.x, yOffset);

		// Adjust the depth slice offset.
		float zNormalized = rgb.z * LUT_SIZE;
		float zSlice = min(floor(zNormalized), LUT_SIZE - 1.0);
		float zMix = (zNormalized - zSlice) * INV_LUT_SIZE;

		// Get the first LUT slice and the one to interpolate to.
		float z1 = zSlice * LUT_TEXEL_SIZE;
		float z2 = (zSlice + 1.0) * LUT_TEXEL_SIZE;

		// The 2D LUT strip extends horizontally.
		uv1.x += z1;
		uv2.x += z2;

		vec3 sample1 = texture2D(lut, uv1).rgb;
		vec3 sample2 = texture2D(lut, uv2).rgb;

		return mix(sample1, sample2, zMix);

	}

#endif

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {

	outputColor = vec4(applyLUT(inputColor.rgb), inputColor.a);

}
