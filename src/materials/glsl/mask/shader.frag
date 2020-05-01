uniform sampler2D maskTexture;
uniform sampler2D inputBuffer;

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

			if(mask > 0.0) {

				discard;

			}

		#else

			if(mask == 0.0) {

				discard;

			}

		#endif

	#else

		mask = clamp(mask * strength, 0.0, 1.0);

		#ifdef INVERTED

			mask = (1.0 - mask);

		#endif

		#if MASK_FUNCTION == 1

			gl_FragColor = mask * texture2D(inputBuffer, vUv);

		#else

			gl_FragColor = vec4(mask * texture2D(inputBuffer, vUv).rgb, mask);

		#endif

	#endif

}
