#include <pp_resolution_pars_fragment>

uniform float kernel;
uniform float scale;

in vec3 position;

out vec2 vUv0, vUv1, vUv2, vUv3, vUv4, vUv5, vUv6, vUv7;

void main() {

	vec2 uv = position.xy * 0.5 + 0.5;
	vec2 halfPixel = 0.5 / (resolution.xy / 2.0);
	float offset = 0.35;
	offset = scale;

	vUv0 = uv + vec2(-halfPixel.x * 2.0, 0.0) * offset;
	vUv1 = uv + vec2(-halfPixel.x, halfPixel.y) * offset;
	vUv2 = uv + vec2(0.0, halfPixel.y * 2.0) * offset;
	vUv3 = uv + vec2(halfPixel.x, halfPixel.y) * offset;
	vUv4 = uv + vec2(halfPixel.x * 2.0, 0.0) * offset;
	vUv5 = uv + vec2(halfPixel.x, -halfPixel.y) * offset;
	vUv6 = uv + vec2(0.0, -halfPixel.y * 2.0) * offset;
	vUv7 = uv + vec2(-halfPixel.x, -halfPixel.y) * offset;

	gl_Position = vec4(position, 1.0);

}
