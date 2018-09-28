uniform vec2 offset;

varying vec2 vUvR;
varying vec2 vUvB;

void mainSupport() {

	vec2 aspectCorrection = vec2(aspect, 1.0);

	vUvR = uv + offset * aspectCorrection;
	vUvB = uv - offset * aspectCorrection;

}
