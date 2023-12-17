#include <pp_precision_fragment>
#include <pp_default_output_pars_fragment>
#include <pp_input_buffer_pars_fragment>

#ifdef MASK_PRECISION_HIGH

	uniform mediump sampler2D maskTexture;

#else

	uniform lowp sampler2D maskTexture;

#endif

#if MASK_FUNCTION != 0

	uniform float strength;

#endif

in vec2 vUv;

void main() {

	#if COLOR_CHANNEL == 0

		float mask = texture(maskTexture, vUv).r;

	#elif COLOR_CHANNEL == 1

		float mask = texture(maskTexture, vUv).g;

	#elif COLOR_CHANNEL == 2

		float mask = texture(maskTexture, vUv).b;

	#else

		float mask = texture(maskTexture, vUv).a;

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
		vec4 texel = texture(inputBuffer, vUv);
		outputColor = vec4(mask * texel.rgb, texel.a);

	#elif MASK_FUNCTION == 2

		// MULTIPLY_RGB_SET_ALPHA
		outputColor = vec4(mask * texture(inputBuffer, vUv).rgb, mask);

	#else

		// MULTIPLY
		outputColor = mask * texture(inputBuffer, vUv);

	#endif

}
