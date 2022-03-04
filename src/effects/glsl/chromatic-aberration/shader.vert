uniform vec2 offset;

varying vec2 vUvR;
varying vec2 vUvB;

void mainSupport(const in vec2 uv) {

	vUvR = uv + offset * vec2(1.0, aspect);
	vUvB = uv - offset * vec2(1.0, aspect);

}
