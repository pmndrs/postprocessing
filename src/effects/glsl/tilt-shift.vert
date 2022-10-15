uniform vec2 rotation;
varying vec2 vUv2;

void mainSupport(const in vec2 uv) {

	vUv2 = (uv - 0.5) * 2.0 * vec2(aspect, 1.0);
	vUv2 = vec2(dot(rotation, vUv2), dot(rotation, vec2(vUv2.y, -vUv2.x)));

}
