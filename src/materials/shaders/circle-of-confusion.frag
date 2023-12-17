#include <pp_precision_fragment>
#include <pp_camera_pars_fragment>
#include <pp_default_output_pars_fragment>
#include <pp_depth_buffer_pars_fragment>
#include <pp_depth_utils_pars_fragment>
#include <common>

uniform float focusDistance;
uniform float focusRange;

in vec2 vUv;

void main() {

	float depth = readDepth(vUv);

	#ifdef PERSPECTIVE_CAMERA

		float viewZ = perspectiveDepthToViewZ(depth, cameraParams.x, cameraParams.y);
		depth = viewZToOrthographicDepth(viewZ, cameraParams.x, cameraParams.y);

	#endif

	float signedDistance = depth - focusDistance;
	float magnitude = smoothstep(0.0, focusRange, abs(signedDistance));

	outputColor.rg = magnitude * vec2(
		step(signedDistance, 0.0),
		step(0.0, signedDistance)
	);

}
