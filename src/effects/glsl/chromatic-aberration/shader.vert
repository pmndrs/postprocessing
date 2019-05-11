uniform vec2 offset;

varying vec2 vUvR;
varying vec2 vUvB;

void mainSupport() {

	vUvR = vUv + offset;
	vUvB = vUv - offset;

}
