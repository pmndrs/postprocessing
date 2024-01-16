#include <pp_resolution_pars_fragment>

in vec3 position;

out vec2 vUv;
out vec2 vUv0, vUv1, vUv2, vUv3;
out vec2 vUv4, vUv5, vUv6, vUv7;

void main() {

	vUv = position.xy * 0.5 + 0.5;

	vUv0 = vUv + resolution.zw * vec2(-1.0, 1.0);
	vUv1 = vUv + resolution.zw * vec2(0.0, 1.0);
	vUv2 = vUv + resolution.zw * vec2(1.0, 1.0);
	vUv3 = vUv + resolution.zw * vec2(-1.0, 0.0);

	vUv4 = vUv + resolution.zw * vec2(1.0, 0.0);
	vUv5 = vUv + resolution.zw * vec2(-1.0, -1.0);
	vUv6 = vUv + resolution.zw * vec2(0.0, -1.0);
	vUv7 = vUv + resolution.zw * vec2(1.0, -1.0);

	gl_Position = vec4(position.xy, 1.0, 1.0);

}
