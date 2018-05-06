uniform float seed;

varying vec2 vUv;
varying vec2 vUv2;

void main() {

	vUv = uv;
	vUv = uv * seed * seed;

	gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);

}
