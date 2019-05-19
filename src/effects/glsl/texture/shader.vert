uniform float scale;

varying vec2 vUv2;

void mainSupport(const in vec2 uv) {

	vUv2 = uv * vec2(aspect, 1.0) * scale;

}
