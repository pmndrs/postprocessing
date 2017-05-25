uniform vec4 offsetRepeat;

varying vec2 vUv;
varying vec2 vUvPattern;

void main() {

	vUv = uv;
	vUvPattern = uv * offsetRepeat.zw + offsetRepeat.xy;
	gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);

}
