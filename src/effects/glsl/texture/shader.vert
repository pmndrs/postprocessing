uniform float scale;

varying vec2 vUv2;

void mainSupport() {

	vUv2 = uv * vec2(aspect, 1.0) * scale;

}
