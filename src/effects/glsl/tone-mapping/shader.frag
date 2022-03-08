#include <tonemapping_pars_fragment>

uniform lowp sampler2D luminanceBuffer;
uniform float whitePoint;
uniform float middleGrey;

#if TONE_MAPPING_MODE != 2

	uniform float averageLuminance;

#endif

vec3 Reinhard2ToneMapping(vec3 color) {

	color *= toneMappingExposure;

	// Calculate the luminance of the current pixel.
	float l = linearToRelativeLuminance(color);

	#if TONE_MAPPING_MODE == 2

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

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {

	#if TONE_MAPPING_MODE == 1

		outputColor = vec4(Reinhard2ToneMapping(inputColor.rgb), inputColor.a);

	#else

		outputColor = vec4(toneMapping(inputColor.rgb), inputColor.a);

	#endif

}
