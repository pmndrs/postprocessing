uniform sampler2D tDiffuse;
uniform float middleGrey;
uniform float maxLuminance;

#ifdef ADAPTED_LUMINANCE

	uniform sampler2D luminanceMap;

#else

	uniform float averageLuminance;

#endif

varying vec2 vUv;

const vec3 LUM_CONVERT = vec3(0.299, 0.587, 0.114);

vec3 toneMap(vec3 vColor) {

	#ifdef ADAPTED_LUMINANCE

		// Get the calculated average luminance.
		float fLumAvg = texture2D(luminanceMap, vec2(0.5, 0.5)).r;

	#else

		float fLumAvg = averageLuminance;

	#endif

	// Calculate the luminance of the current pixel.
	float fLumPixel = dot(vColor, LUM_CONVERT);

	// Apply the modified operator (Eq. 4).
	float fLumScaled = (fLumPixel * middleGrey) / fLumAvg;

	float fLumCompressed = (fLumScaled * (1.0 + (fLumScaled / (maxLuminance * maxLuminance)))) / (1.0 + fLumScaled);
	return fLumCompressed * vColor;

}

void main() {

	vec4 texel = texture2D(tDiffuse, vUv);
	gl_FragColor = vec4(toneMap(texel.rgb), texel.a);

}
