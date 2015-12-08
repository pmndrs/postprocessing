uniform sampler2D lastLum;
uniform sampler2D currentLum;
uniform float delta;
uniform float tau;

varying vec2 vUv;

void main() {

	vec4 lastLum = texture2D(lastLum, vUv, MIP_LEVEL_1X1);
	vec4 currentLum = texture2D(currentLum, vUv, MIP_LEVEL_1X1);

	float fLastLum = lastLum.r;
	float fCurrentLum = currentLum.r;

	// Better results with squared input luminance.
	fCurrentLum *= fCurrentLum;

	// Adapt the luminance using Pattanaik's technique.
	float fAdaptedLum = fLastLum + (fCurrentLum - fLastLum) * (1.0 - exp(-delta * tau));
	// fAdaptedLum = sqrt(fAdaptedLum);

	gl_FragColor = vec4(fAdaptedLum, fAdaptedLum, fAdaptedLum, 1.0);

}
