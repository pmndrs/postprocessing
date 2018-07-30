uniform vec2 resolution;
uniform vec2 texelSize;

uniform float cameraNear;
uniform float cameraFar;
uniform float aspect;
uniform float time;

varying vec2 vUv;

VERTEX_HEAD

void main() {

	vec4 outputPosition = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
	vUv = uv;

	VERTEX_MAIN_SUPPORT

	gl_Position = outputPosition;

}
