#include <pp_resolution_pars_fragment>

uniform float kernel;
uniform float scale;

in vec3 position;

out vec2 vUv0, vUv1, vUv2, vUv3;

void main() {

	vec2 uv = position.xy * 0.5 + 0.5;
	vec2 dUv = (texelSize.zw * vec2(kernel) + texelSize.zw * vec2(0.5)) * scale;

	vUv0 = vec2(uv.x - dUv.x, uv.y + dUv.y);
	vUv1 = vec2(uv.x + dUv.x, uv.y + dUv.y);
	vUv2 = vec2(uv.x + dUv.x, uv.y - dUv.y);
	vUv3 = vec2(uv.x - dUv.x, uv.y - dUv.y);

	gl_Position = vec4(position.xy, 1.0, 1.0);

}
