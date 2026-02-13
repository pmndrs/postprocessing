#define SHAPE_DOT 1
#define SHAPE_HATCH 2
#define SHAPE_SQUARE 3

uniform vec2 rotation;
uniform float invRadius;
uniform float bias;

float hatchHalftone(vec2 uv) {

	return 1.0 - 2.0 * abs(uv.y - 0.5);

}

float squareHalftone(vec2 uv) {

	float s = 2.0 * max(abs(uv.x - 0.5), abs(uv.y - 0.5));
	return 1.0 - pow2(s);

}

float dotHalftone(vec2 uv) {

	const float invDiag = 1.414213562373095; // sqrt(2), or 1.0/length(vec2(0.5))
	return 1.0 - distance(uv, vec2(0.5)) * invDiag;

}

float getSample(vec2 p, float threshold) {

	#if SHAPE == SHAPE_DOT

		float halftone = dotHalftone(p);

	#elif SHAPE == SHAPE_HATCH

		float halftone = hatchHalftone(p);

	#elif SHAPE == SHAPE_SQUARE

		float halftone = squareHalftone(p);

	#endif

	halftone = 1.0 - halftone;
	return (halftone < threshold) ? 1.0 : 0.0;

}

vec4 mainImage(const in vec4 inputColor, const in vec2 uv, const in GData gData) {

	vec2 p = uv * resolution.xy;

	mat2 r = mat2(rotation.y, rotation.x, -rotation.x, rotation.y);
	float threshold = gData.luminance - bias;
	float pattern = 0.0;

	for(int x = 0; x < SAMPLES; x++) {

		for(int y = 0; y < SAMPLES; y++) {

			vec2 coord = p + vec2(x, y) * INV_SAMPLES;
			coord = coord * r * invRadius;
			vec2 gridUv = fract(coord);

			pattern += getSample(gridUv, threshold);

		}

	}

	pattern *= INV_SAMPLES_SQ;

	#ifdef INVERTED

		vec3 result = vec3(1.0 - pattern);

	#else

		vec3 result = vec3(pattern);

	#endif

	#ifdef PREMULTIPLY

		result *= inputColor.rgb;

	#endif

	return vec4(result, inputColor.a);

}
