#include <common>
#include <pp_camera_pars_fragment>
#include <pp_default_output_pars_fragment>
#include <pp_depth_buffer_pars_fragment>
#include <pp_depth_utils_pars_fragment>
#include <pp_world_utils_pars_fragment>

uniform float focusDistance;
uniform float focusRange;

in vec2 vUv;

void main() {

	float depth = readDepth(vUv);
	vec3 viewPosition = getViewPosition(vUv, depth);
	float distance = getDistance(viewPosition);

	float signedDistance = distance - focusDistance;
	float magnitude = smoothstep(0.0, focusRange, abs(signedDistance));

	out_Color.rg = magnitude * vec2(
		step(signedDistance, 0.0),
		step(0.0, signedDistance)
	);

}
