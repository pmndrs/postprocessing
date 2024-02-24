varying vec2 vUv;
varying vec2 vUv0;
varying vec2 vUv1;

#if EDGE_DETECTION_MODE != 0

	varying vec2 vUv2;
	varying vec2 vUv3;
	varying vec2 vUv4;
	varying vec2 vUv5;

#endif

#if EDGE_DETECTION_MODE == 1

	#include <common>

#endif

#if EDGE_DETECTION_MODE == 0 || PREDICATION_MODE == 1

	#ifdef GL_FRAGMENT_PRECISION_HIGH

		uniform highp sampler2D depthBuffer;

	#else

		uniform mediump sampler2D depthBuffer;

	#endif

	float readDepth(const in vec2 uv) {

		#if DEPTH_PACKING == 3201

			return unpackRGBAToDepth(texture2D(depthBuffer, uv));

		#else

			return texture2D(depthBuffer, uv).r;

		#endif

	}

	vec3 gatherNeighbors() {

		float p = readDepth(vUv);
		float pLeft = readDepth(vUv0);
		float pTop = readDepth(vUv1);

		return vec3(p, pLeft, pTop);

	}

#elif PREDICATION_MODE == 2

	uniform sampler2D predicationBuffer;

	vec3 gatherNeighbors() {

		float p = texture2D(predicationBuffer, vUv).r;
		float pLeft = texture2D(predicationBuffer, vUv0).r;
		float pTop = texture2D(predicationBuffer, vUv1).r;

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

	uniform sampler2D inputBuffer;

#endif

void main() {

	#if EDGE_DETECTION_MODE == 0

		const vec2 threshold = vec2(DEPTH_THRESHOLD);

	#elif PREDICATION_MODE != 0

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

		gl_FragColor = vec4(edges, 0.0, 1.0);

	#elif EDGE_DETECTION_MODE == 1

		// Luma-based edge detection.

		float l = luminance(texture2D(inputBuffer, vUv).rgb);
		float lLeft = luminance(texture2D(inputBuffer, vUv0).rgb);
		float lTop  = luminance(texture2D(inputBuffer, vUv1).rgb);

		vec4 delta;
		delta.xy = abs(l - vec2(lLeft, lTop));

		vec2 edges = step(threshold, delta.xy);

		if(dot(edges, vec2(1.0)) == 0.0) {

			discard;

		}

		// Calculate right and bottom deltas.
		float lRight = luminance(texture2D(inputBuffer, vUv2).rgb);
		float lBottom  = luminance(texture2D(inputBuffer, vUv3).rgb);
		delta.zw = abs(l - vec2(lRight, lBottom));

		// Calculate the maximum delta in the direct neighborhood.
		vec2 maxDelta = max(delta.xy, delta.zw);

		// Calculate left-left and top-top deltas.
		float lLeftLeft = luminance(texture2D(inputBuffer, vUv4).rgb);
		float lTopTop = luminance(texture2D(inputBuffer, vUv5).rgb);
		delta.zw = abs(vec2(lLeft, lTop) - vec2(lLeftLeft, lTopTop));

		// Calculate the final maximum delta.
		maxDelta = max(maxDelta.xy, delta.zw);
		float finalDelta = max(maxDelta.x, maxDelta.y);

		// Local contrast adaptation.
		edges.xy *= step(finalDelta, LOCAL_CONTRAST_ADAPTATION_FACTOR * delta.xy);

		gl_FragColor = vec4(edges, 0.0, 1.0);

	#elif EDGE_DETECTION_MODE == 2

		// Chroma-based edge detection.

		vec4 delta;
		vec3 c = texture2D(inputBuffer, vUv).rgb;

		vec3 cLeft = texture2D(inputBuffer, vUv0).rgb;
		vec3 t = abs(c - cLeft);
		delta.x = max(max(t.r, t.g), t.b);

		vec3 cTop = texture2D(inputBuffer, vUv1).rgb;
		t = abs(c - cTop);
		delta.y = max(max(t.r, t.g), t.b);

		vec2 edges = step(threshold, delta.xy);

		if(dot(edges, vec2(1.0)) == 0.0) {

			discard;

		}

		// Calculate right and bottom deltas.
		vec3 cRight = texture2D(inputBuffer, vUv2).rgb;
		t = abs(c - cRight);
		delta.z = max(max(t.r, t.g), t.b);

		vec3 cBottom = texture2D(inputBuffer, vUv3).rgb;
		t = abs(c - cBottom);
		delta.w = max(max(t.r, t.g), t.b);

		// Calculate the maximum delta in the direct neighborhood.
		vec2 maxDelta = max(delta.xy, delta.zw);

		// Calculate left-left and top-top deltas.
		vec3 cLeftLeft = texture2D(inputBuffer, vUv4).rgb;
		t = abs(c - cLeftLeft);
		delta.z = max(max(t.r, t.g), t.b);

		vec3 cTopTop = texture2D(inputBuffer, vUv5).rgb;
		t = abs(c - cTopTop);
		delta.w = max(max(t.r, t.g), t.b);

		// Calculate the final maximum delta.
		maxDelta = max(maxDelta.xy, delta.zw);
		float finalDelta = max(maxDelta.x, maxDelta.y);

		// Local contrast adaptation.
		edges *= step(finalDelta, LOCAL_CONTRAST_ADAPTATION_FACTOR * delta.xy);

		gl_FragColor = vec4(edges, 0.0, 1.0);

	#endif

}
