#include <pp_resolution_pars_fragment>

in vec3 position;

out vec2 vUv;
out vec2 vUv0;
out vec2 vUv1;

#if EDGE_DETECTION_MODE != 0

	out vec2 vUv2, vUv3, vUv4, vUv5;

#endif

void main() {

	vUv = position.xy * 0.5 + 0.5;

	// Left and top texel coordinates.
	vUv0 = vUv + resolution.zw * vec2(-1.0, 0.0);
	vUv1 = vUv + resolution.zw * vec2(0.0, -1.0);

	#if EDGE_DETECTION_MODE != 0

		// Right and bottom texel coordinates.
		vUv2 = vUv + resolution.zw * vec2(1.0, 0.0);
		vUv3 = vUv + resolution.zw * vec2(0.0, 1.0);

		// Left-left and top-top texel coordinates.
		vUv4 = vUv + resolution.zw * vec2(-2.0, 0.0);
		vUv5 = vUv + resolution.zw * vec2(0.0, -2.0);

	#endif

	gl_Position = vec4(position.xy, 1.0, 1.0);

}
