uniform vec3 scale;
uniform vec3 offset;

#ifdef CUSTOM_INPUT_DOMAIN

	uniform vec3 domainMin;
	uniform vec3 domainMax;

#endif

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

		#ifdef TETRAHEDRAL_INTERPOLATION

			/* Strategy: Fetch the four corners (v1, v2, v3, v4) of the tetrahedron that corresponds to the input coordinates,
			calculate the barycentric weights and interpolate the nearest color samples. */

			vec3 p = floor(rgb);
			vec3 f = rgb - p;

			vec3 v1 = (p + 0.5) * LUT_TEXEL_WIDTH;
			vec3 v4 = (p + 1.5) * LUT_TEXEL_WIDTH;
			vec3 v2, v3; // Must be identified.
			vec3 frac;

			if(f.r >= f.g) {

				if(f.g > f.b) {

					// T4: R >= G > B
					frac = f.rgb;
					v2 = vec3(v4.x, v1.y, v1.z);
					v3 = vec3(v4.x, v4.y, v1.z);

				} else if(f.r >= f.b) {

					// T6: R >= B >= G
					frac = f.rbg;
					v2 = vec3(v4.x, v1.y, v1.z);
					v3 = vec3(v4.x, v1.y, v4.z);

				} else {

					// T2: B > R >= G
					frac = f.brg;
					v2 = vec3(v1.x, v1.y, v4.z);
					v3 = vec3(v4.x, v1.y, v4.z);

				}

			} else {

				if(f.b > f.g) {

					// T3: B > G > R
					frac = f.bgr;
					v2 = vec3(v1.x, v1.y, v4.z);
					v3 = vec3(v1.x, v4.y, v4.z);

				} else if(f.r >= f.b) {

					// T5: G > R >= B
					frac = f.grb;
					v2 = vec3(v1.x, v4.y, v1.z);
					v3 = vec3(v4.x, v4.y, v1.z);

				} else {

					// T1: G >= B > R
					frac = f.gbr;
					v2 = vec3(v1.x, v4.y, v1.z);
					v3 = vec3(v1.x, v4.y, v4.z);

				}

			}

			// Interpolate manually to avoid 8-bit quantization of fractions.
			vec4 n1 = texture(lut, v1);
			vec4 n2 = texture(lut, v2);
			vec4 n3 = texture(lut, v3);
			vec4 n4 = texture(lut, v4);

			vec4 weights = vec4(
				1.0 - frac.x,
				frac.x - frac.y,
				frac.y - frac.z,
				frac.z
			);

			// weights.x * n1 + weights.y * n2 + weights.z * n3 + weights.w * n4
			vec4 result = weights * mat4(
				vec4(n1.r, n2.r, n3.r, n4.r),
				vec4(n1.g, n2.g, n3.g, n4.g),
				vec4(n1.b, n2.b, n3.b, n4.b),
				vec4(1.0)
			);

			return vec4(result.rgb, 1.0);

		#else

			/* Built-in trilinear interpolation. Note that the fractional components are quantized to 8 bits on common
			hardware, which introduces significant error with small grid sizes. */
			return texture(lut, rgb);

		#endif

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
		float slice0 = floor(slice);
		float interp = slice - slice0;
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

		// Manual trilinear interpolation (subject to quantization errors).
		vec4 sample0 = texture2D(lut, uv0);
		vec4 sample1 = texture2D(lut, uv1);

		return mix(sample0, sample1, abs(centeredInterp));

	}

#endif

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {

	vec3 c = inputColor.rgb;

	#ifdef CUSTOM_INPUT_DOMAIN

		if(c.r >= domainMin.r && c.g >= domainMin.g && c.b >= domainMin.b &&
			c.r <= domainMax.r && c.g <= domainMax.g && c.b <= domainMax.b) {

			c = applyLUT(scale * c + offset).rgb;

		} else {

			c = inputColor.rgb;

		}

	#else

		#if !defined(LUT_3D) || defined(TETRAHEDRAL_INTERPOLATION)

			c = clamp(c, 0.0, 1.0);

		#endif

		c = applyLUT(scale * c + offset).rgb;

	#endif

	outputColor = vec4(c, inputColor.a);

}
