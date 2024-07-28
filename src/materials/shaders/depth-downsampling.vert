#include <pp_resolution_pars_fragment>

out vec2 vUv0, vUv1, vUv2, vUv3;

void main() {

	vec2 uv = position.xy * 0.5 + 0.5;

	vUv0 = uv;
	vUv1 = vec2(uv.x, uv.y + resolution.w);
	vUv2 = vec2(uv.x + resolution.z, uv.y);
	vUv3 = uv + resolution.zw;

	gl_Position = vec4(position.xy, 1.0, 1.0);

}
