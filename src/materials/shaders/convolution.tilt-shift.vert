#include <pp_resolution_pars_fragment>

uniform float kernel;
uniform float scale;
uniform float aspect;
uniform vec2 rotation;

out vec2 vUv;
out vec2 vUv2;
out vec2 vOffset;

void main() {

	vec2 uv = position.xy * 0.5 + 0.5;

	vUv = uv;
	vUv2 = (uv - 0.5) * 2.0 * vec2(aspect, 1.0);
	vUv2 = vec2(dot(rotation, vUv2), dot(rotation, vec2(vUv2.y, -vUv2.x)));
	vOffset = (texelSize.zw * vec2(kernel) + texelSize.zw * vec2(0.5)) * scale;

	gl_Position = vec4(position.xy, 1.0, 1.0);

}
