#include <pp_resolution_pars_fragment>

uniform vec2 direction;
uniform float scale;

in vec3 position;

out vec2 vOffset;
out vec2 vUv;

void main() {

	vOffset = direction * resolution.zw * scale;
	vUv = position.xy * 0.5 + 0.5;
	gl_Position = vec4(position.xy, 1.0, 1.0);

}
