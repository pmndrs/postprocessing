uniform sampler2D tPreviousLum;
uniform sampler2D tCurrentLum;
uniform float delta;
uniform float tau;

varying vec2 vUv;

void main() {

	float previousLum = texture2D(tPreviousLum, vUv, MIP_LEVEL_1X1).r;
	float currentLum = texture2D(tCurrentLum, vUv, MIP_LEVEL_1X1).r;

	// Adapt the luminance using Pattanaik's technique.
	float adaptedLum = previousLum + (currentLum - previousLum) * (1.0 - exp(-delta * tau));

	gl_FragColor = vec4(adaptedLum, adaptedLum, adaptedLum, 1.0);

}
