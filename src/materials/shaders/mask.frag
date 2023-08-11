#ifdef FRAMEBUFFER_PRECISION_HIGH

	uniform mediump sampler2D inputBuffer;

#else

	uniform lowp sampler2D inputBuffer;

#endif

#ifdef MASK_PRECISION_HIGH

	uniform mediump sampler2D maskTexture;

#else

	uniform lowp sampler2D maskTexture;

#endif

#if MASK_FUNCTION != 0

	uniform float strength;

#endif

varying vec2 vUv;

void main() {

	#if COLOR_CHANNEL == 0

		float mask = texture2D(maskTexture, vUv).r;

	#elif COLOR_CHANNEL == 1

		float mask = texture2D(maskTexture, vUv).g;

	#elif COLOR_CHANNEL == 2

		float mask = texture2D(maskTexture, vUv).b;

	#else

		float mask = texture2D(maskTexture, vUv).a;

	#endif

	#if MASK_FUNCTION == 0

		#ifdef INVERTED

			// (mask > 0.0) ? 0.0 : 1.0;
			mask = step(mask, 0.0);

		#else

			// (mask > 0.0) ? 1.0 : 0.0;
			mask = 1.0 - step(mask, 0.0);

		#endif

	#else

		mask = clamp(mask * strength, 0.0, 1.0);

		#ifdef INVERTED

			mask = 1.0 - mask;

		#endif

	#endif

	#if MASK_FUNCTION == 3

		// MULTIPLY_RGB
		vec4 texel = texture2D(inputBuffer, vUv);
		gl_FragColor = vec4(mask * texel.rgb, texel.a);

	#elif MASK_FUNCTION == 2

		// MULTIPLY_RGB_SET_ALPHA
		gl_FragColor = vec4(mask * texture2D(inputBuffer, vUv).rgb, mask);

	#else

		// MULTIPLY
		gl_FragColor = mask * texture2D(inputBuffer, vUv);

	#endif

}
