uniform vec4 resolution; // XY = resolution, ZW = texelSize
uniform vec3 cameraParams; // near, far, aspect
uniform float time;

varying vec2 vUv;

VERTEX_HEAD

void main() {

	vUv = position.xy * 0.5 + 0.5;

	VERTEX_MAIN_SUPPORT

	gl_Position = vec4(position.xy, 1.0, 1.0);

}
