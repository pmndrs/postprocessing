uniform vec2 offset;

varying float vActive;
varying vec2 vUvR;
varying vec2 vUvB;

void mainSupport(const in vec2 uv) {

	vec2 shift = offset * vec2(1.0, aspect);
	vActive = (shift.x != 0.0 || shift.y != 0.0) ? 1.0 : 0.0;
	vUvR = uv + shift;
	vUvB = uv - shift;

}
