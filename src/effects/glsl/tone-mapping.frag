#include <tonemapping_pars_fragment>

uniform float whitePoint;

#if TONE_MAPPING_MODE == 2 || TONE_MAPPING_MODE == 3

	// Reinhard 2

	uniform float middleGrey;

	#if TONE_MAPPING_MODE == 3

		uniform lowp sampler2D luminanceBuffer;

	#else

		uniform float averageLuminance;

	#endif

	vec3 Reinhard2ToneMapping(vec3 color) {

		color *= toneMappingExposure;

		// Calculate the luminance of the current pixel.
		float l = luminance(color);

		#if TONE_MAPPING_MODE == 3

			// Get the average luminance from the adaptive 1x1 buffer.
			float lumAvg = unpackRGBAToFloat(texture2D(luminanceBuffer, vec2(0.5)));

		#else

			float lumAvg = averageLuminance;

		#endif

		float lumScaled = (l * middleGrey) / max(lumAvg, 1e-6);
		float lumCompressed = lumScaled * (1.0 + lumScaled / (whitePoint * whitePoint));
		lumCompressed /= (1.0 + lumScaled);

		return clamp(lumCompressed * color, 0.0, 1.0);

	}

#elif TONE_MAPPING_MODE == 4

	// Uncharted 2: http://filmicworlds.com/blog/filmic-tonemapping-operators

	#define A 0.15
	#define B 0.50
	#define C 0.10
	#define D 0.20
	#define E 0.02
	#define F 0.30

	vec3 Uncharted2Helper(const in vec3 x) {

		return ((x * (A * x + C * B) + D * E) / (x * (A * x + B) + D * F)) - E / F;

	}

	vec3 Uncharted2ToneMapping(vec3 color) {

		color *= toneMappingExposure;
		return clamp(Uncharted2Helper(color) / Uncharted2Helper(vec3(whitePoint)), 0.0, 1.0);

	}

#endif

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {

	#if TONE_MAPPING_MODE == 2 || TONE_MAPPING_MODE == 3

		outputColor = vec4(Reinhard2ToneMapping(inputColor.rgb), inputColor.a);

	#elif TONE_MAPPING_MODE == 4

		outputColor = vec4(Uncharted2ToneMapping(inputColor.rgb), inputColor.a);

	#else

		outputColor = vec4(toneMapping(inputColor.rgb), inputColor.a);

	#endif

}
