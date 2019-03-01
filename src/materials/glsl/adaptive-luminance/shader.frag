uniform sampler2D previousLuminanceBuffer;
uniform sampler2D currentLuminanceBuffer;
uniform float minLuminance;
uniform float deltaTime;
uniform float tau;

varying vec2 vUv;

void main() {

	float previousLuminance = texture2D(previousLuminanceBuffer, vUv, MIP_LEVEL_1X1).r;
	float currentLuminance = texture2D(currentLuminanceBuffer, vUv, MIP_LEVEL_1X1).r;

	previousLuminance = max(minLuminance, previousLuminance);
	currentLuminance = max(minLuminance, currentLuminance);

	// Adapt the luminance using Pattanaik's technique.
	float adaptedLum = previousLuminance + (currentLuminance - previousLuminance) * (1.0 - exp(-deltaTime * tau));

	gl_FragColor.r = adaptedLum;

}
