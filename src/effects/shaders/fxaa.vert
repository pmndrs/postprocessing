out vec2 vUvDown;
out vec2 vUvUp;
out vec2 vUvLeft;
out vec2 vUvRight;

out vec2 vUvDownLeft;
out vec2 vUvUpRight;
out vec2 vUvUpLeft;
out vec2 vUvDownRight;

void mainSupport(const in vec2 uv) {

	vUvDown = uv + vec2(0.0, -1.0) * resolution.zw;
	vUvUp = uv + vec2(0.0, 1.0) * resolution.zw;
	vUvRight = uv + vec2(1.0, 0.0) * resolution.zw;
	vUvLeft = uv + vec2(-1.0, 0.0) * resolution.zw;

	vUvDownLeft = uv + vec2(-1.0, -1.0) * resolution.zw;
	vUvUpRight = uv + vec2(1.0, 1.0) * resolution.zw;
	vUvUpLeft = uv + vec2(-1.0, 1.0) * resolution.zw;
	vUvDownRight = uv + vec2(1.0, -1.0) * resolution.zw;

}