uniform vec2 offset;

varying vec2 vUvR;
varying vec2 vUvB;

void mainSupport(const in vec2 uv) {

	vec2 shift = offset * vec2(1.0, aspect);
	vUvR = uv + shift;
	vUvB = uv - shift;

}
