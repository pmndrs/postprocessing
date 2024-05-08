#include <pp_resolution_pars_fragment>

uniform float scale;

in vec3 position;

out vec2 vUv0, vUv1, vUv2, vUv3, vUv4;

void main() {

	vec2 uv = position.xy * 0.5 + 0.5;
	vec2 halfPixel = 0.5 / (resolution.xy / 2.0);

	vUv0 = uv;
	vUv1 = vec2(uv - halfPixel.xy * scale);
	vUv2 = vec2(uv + halfPixel.xy * scale);
	vUv3 = vec2(uv + vec2(halfPixel.x, -halfPixel.y) * scale);
	vUv4 = vec2(uv - vec2(halfPixel.x, -halfPixel.y) * scale);

	gl_Position = vec4(position, 1.0);

}
