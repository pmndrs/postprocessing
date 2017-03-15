uniform float size;
uniform float scale;
uniform float cameraDistance;

varying vec2 vUv;
varying float vSize;

void main() {

	vUv = uv;
	vSize = (0.1 * cameraDistance) / size;
	gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);

}
