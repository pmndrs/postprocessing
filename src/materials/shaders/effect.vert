#include <pp_resolution_pars_fragment>

uniform vec3 cameraParams;
uniform float time;

in vec3 position;
out vec2 vUv;

$VERTEX_HEAD

void main() {

	vUv = position.xy * 0.5 + 0.5;

	$VERTEX_MAIN_SUPPORT

	gl_Position = vec4(position.xy, 1.0, 1.0);

}
