#ifdef USE_CDL

	struct ColorDecisionList {
		vec3 slope;
		vec3 offset;
		vec3 power;
		float saturation;
	};

	uniform ColorDecisionList cdl;

	/**
	 * Applies ASC CDL v1.2 color grade to input color in an unspecified log or linear space.
	 *
	 * @see https://blender.stackexchange.com/a/55239/43930
	 * @see https://docs.acescentral.com/specifications/acescc/
	 * @param color - A color in a log space (such as LogC, ACEScc, or AgX Log).
	 * @return - The transformed color (same color space).
	 */

	vec3 applyCDL(in vec3 color) {

		// ASC CDL v1.2 explicitly requires Rec. 709 luminance coefficients.
		float l = dot(color, vec3(0.2126, 0.7152, 0.0722));
		vec3 v = max(color * cdl.slope + cdl.offset, 0.0);
		vec3 pv = pow(v, cdl.power);

		if(v.r > 0.0) { v.r = pv.r; }
		if(v.g > 0.0) { v.g = pv.g; }
		if(v.b > 0.0) { v.b = pv.b; }

		return (v - l) * cdl.saturation + l;

	}

#else

	#define applyCDL(color) color

#endif

#include <tonemapping_pars_fragment>

vec4 mainImage(const in vec4 inputColor, const in vec2 uv, const in GData gData) {

	vec3 result;

	#if TONE_MAPPING == 0

		result = LinearToneMapping(inputColor.rgb);

	#elif TONE_MAPPING == 1

		result = ReinhardToneMapping(inputColor.rgb);

	#elif TONE_MAPPING == 2

		result = CineonToneMapping(inputColor.rgb);

	#elif TONE_MAPPING == 3

		result = ACESFilmicToneMapping(inputColor.rgb);

	#elif TONE_MAPPING == 4

		result = AgXToneMapping(inputColor.rgb);

	#elif TONE_MAPPING == 5

		result = NeutralToneMapping(inputColor.rgb);

	#elif TONE_MAPPING == 6

		result = CustomToneMapping(inputColor.rgb);

	#endif

	return vec4(result, inputColor.a);

}
