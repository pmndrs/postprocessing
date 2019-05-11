uniform vec2 resolution;
uniform vec2 texelSize;

uniform float cameraNear;
uniform float cameraFar;
uniform float aspect;
uniform float time;

varying vec2 vUv;

VERTEX_HEAD

void main() {

	vUv = position.xy * 0.5 + 0.5;

	VERTEX_MAIN_SUPPORT

	gl_Position = vec4(position.xy, 1.0, 1.0);

}
