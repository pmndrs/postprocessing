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

	vec4 applyLUT(vec3 rgb) {

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

			// Common 2D LUTs extend horizontally.
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

	vec3 c = linearToInputTexel(inputColor).rgb;
	c = texelToLinear(applyLUT(c)).rgb;
	outputColor = vec4(c, inputColor.a);

}
