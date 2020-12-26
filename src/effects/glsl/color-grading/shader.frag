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

	vec4 applyLUT(vec3 rgb) {

		return texture(lut, rgb);

	}

#else

	vec4 applyLUT(vec3 rgb) {

		// Prevent interpolation artifacts between adjacent slices.
		rgb.xy = clamp(rgb.xy, LUT_HALF_TEXEL_SIZE, 1.0 - LUT_HALF_TEXEL_SIZE);

		// Calculate the depth slice offset.
		float zNormalized = rgb.z * LUT_SIZE;
		float zSlice = min(floor(zNormalized), LUT_SIZE - 1.0);
		float zMix = (zNormalized - zSlice) * LUT_TEXEL_SIZE;

		// Get two LUT slices for interpolation.
		float z1 = zSlice * LUT_TEXEL_SIZE;
		float z2 = (zSlice + 1.0) * LUT_TEXEL_SIZE;

		#ifdef LUT_STRIP_HORIZONTAL

			// Common 2D strip LUTs extend horizontally.
			float xOffset = rgb.x * LUT_TEXEL_SIZE;
			vec2 uv1 = vec2(xOffset, rgb.y);
			vec2 uv2 = vec2(uv1);

			uv1.x += z1;
			uv2.x += z2;

		#else

			// 3D LUTs extend vertically when used as 2D textures.
			float yOffset = rgb.y * LUT_TEXEL_SIZE;
			vec2 uv1 = vec2(rgb.x, yOffset);
			vec2 uv2 = vec2(uv1);

			uv1.y += z1;
			uv2.y += z2;

		#endif

		vec4 sample1 = texture2D(lut, uv1);
		vec4 sample2 = texture2D(lut, uv2);

		return mix(sample1, sample2, zMix);

	}

#endif

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {

	#ifdef USE_LUT

		outputColor = vec4(texelToLinear(applyLUT(inputColor.rgb)).rgb, inputColor.a);

	#else

		outputColor = inputColor;

	#endif

}
