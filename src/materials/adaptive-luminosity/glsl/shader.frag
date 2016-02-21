uniform sampler2D lastLuminanceMap;
uniform sampler2D currentLuminanceMap;
uniform float delta;
uniform float tau;

varying vec2 vUv;

void main() {

	vec4 lastLumTexel = texture2D(lastLuminanceMap, vUv, MIP_LEVEL_1X1);
	vec4 currentLumTexel = texture2D(currentLuminanceMap, vUv, MIP_LEVEL_1X1);

	float lastLum = lastLumTexel.r;
	float currentLum = currentLumTexel.r;

	// Better results with squared input luminance.
	currentLum *= currentLum;

	// Adapt the luminance using Pattanaik's technique.
	float adaptedLum = lastLum + (currentLum - lastLum) * (1.0 - exp(-delta * tau));
	//adaptedLum = sqrt(adaptedLum);

	gl_FragColor = vec4(adaptedLum, adaptedLum, adaptedLum, 1.0);

}
