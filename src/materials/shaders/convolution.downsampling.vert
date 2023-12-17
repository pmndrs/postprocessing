#include <pp_resolution_pars_fragment>

out vec2 vUv;
out vec2 vUv00, vUv01, vUv02, vUv03;
out vec2 vUv04, vUv05, vUv06, vUv07;
out vec2 vUv08, vUv09, vUv10, vUv11;

void main() {

	vUv = position.xy * 0.5 + 0.5;

	vUv00 = vUv + resolution.zw * vec2(-1.0, 1.0);
	vUv01 = vUv + resolution.zw * vec2(1.0, 1.0);
	vUv02 = vUv + resolution.zw * vec2(-1.0, -1.0);
	vUv03 = vUv + resolution.zw * vec2(1.0, -1.0);

	vUv04 = vUv + resolution.zw * vec2(-2.0, 2.0);
	vUv05 = vUv + resolution.zw * vec2(0.0, 2.0);
	vUv06 = vUv + resolution.zw * vec2(2.0, 2.0);
	vUv07 = vUv + resolution.zw * vec2(-2.0, 0.0);
	vUv08 = vUv + resolution.zw * vec2(2.0, 0.0);
	vUv09 = vUv + resolution.zw * vec2(-2.0, -2.0);
	vUv10 = vUv + resolution.zw * vec2(0.0, -2.0);
	vUv11 = vUv + resolution.zw * vec2(2.0, -2.0);

	gl_Position = vec4(position.xy, 1.0, 1.0);

}
