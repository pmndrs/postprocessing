#include <pp_precision_fragment>
#include <pp_default_output_pars_fragment>

in vec2 vUv;
in vec2 vUv0;
in vec2 vUv1;

#if EDGE_DETECTION_MODE != 0

	in vec2 vUv2, vUv3, vUv4, vUv5;

#endif

#if EDGE_DETECTION_MODE == 1

	// Include the luminance function.
	#include <common>

#endif

#if EDGE_DETECTION_MODE == 0 || PREDICATION_MODE == 1

	#include <pp_depth_buffer_pars_fragment>
	#include <pp_depth_utils_pars_fragment>
	#include <packing>

	float getOrthographicDepth(sampler2D depthBuffer, const in vec2 uv, const in float near, const in float far) {

		float depth = readDepth(depthBuffer, uv, near, far);

		#ifdef PERSPECTIVE_CAMERA

			float viewZ = perspectiveDepthToViewZ(depth, near, far);
			return viewZToOrthographicDepth(viewZ, near, far);

		#else

			return depth;

		#endif

	}

	uniform vec2 cameraParams;

	vec3 gatherNeighbors() {

		float p = getOrthographicDepth(depthBuffer, vUv, cameraParams.x, cameraParams.y);
		float pLeft = getOrthographicDepth(depthBuffer, vUv0, cameraParams.x, cameraParams.y);
		float pTop = getOrthographicDepth(depthBuffer, vUv1, cameraParams.x, cameraParams.y);

		return vec3(p, pLeft, pTop);

	}

#elif PREDICATION_MODE == 2

	#ifdef PREDICATIONBUFFER_PRECISION_HIGH

		uniform mediump sampler2D predicationBuffer;

	#else

		uniform lowp sampler2D predicationBuffer;

	#endif

	vec3 gatherNeighbors() {

		float p = texture(predicationBuffer, vUv).r;
		float pLeft = texture(predicationBuffer, vUv0).r;
		float pTop = texture(predicationBuffer, vUv1).r;

		return vec3(p, pLeft, pTop);

	}

#endif

#if PREDICATION_MODE != 0

	vec2 calculatePredicatedThreshold() {

		vec3 neighbours = gatherNeighbors();
		vec2 delta = abs(neighbours.xx - neighbours.yz);
		vec2 edges = step(PREDICATION_THRESHOLD, delta);

		return PREDICATION_SCALE * EDGE_THRESHOLD * (1.0 - PREDICATION_STRENGTH * edges);

	}

#endif

#if EDGE_DETECTION_MODE != 0

	#include <pp_input_buffer_pars_fragment>

#endif

void main() {

	#if PREDICATION_MODE != 0 && EDGE_DETECTION_MODE != 0

		vec2 threshold = calculatePredicatedThreshold();

	#else

		const vec2 threshold = vec2(EDGE_THRESHOLD);

	#endif

	#if EDGE_DETECTION_MODE == 0

		// Depth-based edge detection.

		vec3 neighbors = gatherNeighbors();
		vec2 delta = abs(neighbors.xx - vec2(neighbors.y, neighbors.z));
		vec2 edges = step(threshold, delta);

		if(dot(edges, vec2(1.0)) == 0.0) {

			discard;

		}

		out_Color = vec4(edges, 0.0, 1.0);

	#elif EDGE_DETECTION_MODE == 1

		// Luma-based edge detection.

		float l = luminance(texture(inputBuffer, vUv).rgb);
		float lLeft = luminance(texture(inputBuffer, vUv0).rgb);
		float lTop  = luminance(texture(inputBuffer, vUv1).rgb);

		vec4 delta;
		delta.xy = abs(l - vec2(lLeft, lTop));

		vec2 edges = step(threshold, delta.xy);

		if(dot(edges, vec2(1.0)) == 0.0) {

			discard;

		}

		// Calculate right and bottom deltas.
		float lRight = luminance(texture(inputBuffer, vUv2).rgb);
		float lBottom  = luminance(texture(inputBuffer, vUv3).rgb);
		delta.zw = abs(l - vec2(lRight, lBottom));

		// Calculate the maximum delta in the direct neighborhood.
		vec2 maxDelta = max(delta.xy, delta.zw);

		// Calculate left-left and top-top deltas.
		float lLeftLeft = luminance(texture(inputBuffer, vUv4).rgb);
		float lTopTop = luminance(texture(inputBuffer, vUv5).rgb);
		delta.zw = abs(vec2(lLeft, lTop) - vec2(lLeftLeft, lTopTop));

		// Calculate the final maximum delta.
		maxDelta = max(maxDelta.xy, delta.zw);
		float finalDelta = max(maxDelta.x, maxDelta.y);

		// Local contrast adaptation.
		edges.xy *= step(finalDelta, LOCAL_CONTRAST_ADAPTATION_FACTOR * delta.xy);

		out_Color = vec4(edges, 0.0, 1.0);

	#elif EDGE_DETECTION_MODE == 2

		// Chroma-based edge detection.

		vec4 delta;
		vec3 c = texture(inputBuffer, vUv).rgb;

		vec3 cLeft = texture(inputBuffer, vUv0).rgb;
		vec3 t = abs(c - cLeft);
		delta.x = max(max(t.r, t.g), t.b);

		vec3 cTop = texture(inputBuffer, vUv1).rgb;
		t = abs(c - cTop);
		delta.y = max(max(t.r, t.g), t.b);

		vec2 edges = step(threshold, delta.xy);

		if(dot(edges, vec2(1.0)) == 0.0) {

			discard;

		}

		// Calculate right and bottom deltas.
		vec3 cRight = texture(inputBuffer, vUv2).rgb;
		t = abs(c - cRight);
		delta.z = max(max(t.r, t.g), t.b);

		vec3 cBottom = texture(inputBuffer, vUv3).rgb;
		t = abs(c - cBottom);
		delta.w = max(max(t.r, t.g), t.b);

		// Calculate the maximum delta in the direct neighborhood.
		vec2 maxDelta = max(delta.xy, delta.zw);

		// Calculate left-left and top-top deltas.
		vec3 cLeftLeft = texture(inputBuffer, vUv4).rgb;
		t = abs(c - cLeftLeft);
		delta.z = max(max(t.r, t.g), t.b);

		vec3 cTopTop = texture(inputBuffer, vUv5).rgb;
		t = abs(c - cTopTop);
		delta.w = max(max(t.r, t.g), t.b);

		// Calculate the final maximum delta.
		maxDelta = max(maxDelta.xy, delta.zw);
		float finalDelta = max(maxDelta.x, maxDelta.y);

		// Local contrast adaptation.
		edges *= step(finalDelta, LOCAL_CONTRAST_ADAPTATION_FACTOR * delta.xy);

		out_Color = vec4(edges, 0.0, 1.0);

	#endif

}
