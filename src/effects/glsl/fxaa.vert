varying vec2 vUvDown;
varying vec2 vUvUp;
varying vec2 vUvLeft;
varying vec2 vUvRight;

varying vec2 vUvDownLeft;
varying vec2 vUvUpRight;
varying vec2 vUvUpLeft;
varying vec2 vUvDownRight;

void mainSupport(const in vec2 uv) {

	vUvDown = uv + vec2(0.0, -1.0) * texelSize;
	vUvUp = uv + vec2(0.0, 1.0) * texelSize;
	vUvRight = uv + vec2(1.0, 0.0) * texelSize;
	vUvLeft = uv + vec2(-1.0, 0.0) * texelSize;

	vUvDownLeft = uv + vec2(-1.0, -1.0) * texelSize;
	vUvUpRight = uv + vec2(1.0, 1.0) * texelSize;
	vUvUpLeft = uv + vec2(-1.0, 1.0) * texelSize;
	vUvDownRight = uv + vec2(1.0, -1.0) * texelSize;

}
