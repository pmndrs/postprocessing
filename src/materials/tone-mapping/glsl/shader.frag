uniform sampler2D tDiffuse;
uniform float middleGrey;
uniform float maxLuminance;

#ifdef ADAPTED_LUMINANCE

	uniform sampler2D luminanceMap;

#else

	uniform float averageLuminance;

#endif

varying vec2 vUv;

const vec3 LUM_COEFF = vec3(0.299, 0.587, 0.114);
const vec2 CENTER = vec2(0.5, 0.5);

vec3 toneMap(vec3 c) {

	#ifdef ADAPTED_LUMINANCE

		// Get the calculated average luminance.
		float lumAvg = texture2D(luminanceMap, CENTER).r;

	#else

		float lumAvg = averageLuminance;

	#endif

	// Calculate the luminance of the current pixel.
	float lumPixel = dot(c, LUM_COEFF);

	// Apply the modified operator (Reinhard Eq. 4).
	float lumScaled = (lumPixel * middleGrey) / lumAvg;

	float lumCompressed = (lumScaled * (1.0 + (lumScaled / (maxLuminance * maxLuminance)))) / (1.0 + lumScaled);

	return lumCompressed * c;

}

void main() {

	vec4 texel = texture2D(tDiffuse, vUv);
	gl_FragColor = vec4(toneMap(texel.rgb), texel.a);

}
