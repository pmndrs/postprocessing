#include <packing>

#ifdef GL_FRAGMENT_PRECISION_HIGH

	uniform highp sampler2D depthBuffer;

#else

	uniform mediump sampler2D depthBuffer;

#endif

varying vec2 vUv;
varying vec2 vUv0;
varying vec2 vUv1;

float readDepth(const in vec2 uv) {

	#if DEPTH_PACKING == 3201

		return unpackRGBAToDepth(texture2D(depthBuffer, uv));

	#else

		return texture2D(depthBuffer, uv).r;

	#endif

}

/**
 * Gathers the current texel, and the top-left neighbors.
 */

vec3 gatherNeighbors() {

	float p = readDepth(vUv);
	float pLeft = readDepth(vUv0);
	float pTop = readDepth(vUv1);

	return vec3(p, pLeft, pTop);

}

void main() {

	const vec2 threshold = vec2(DEPTH_THRESHOLD);

	vec3 neighbors = gatherNeighbors();
	vec2 delta = abs(neighbors.xx - vec2(neighbors.y, neighbors.z));
	vec2 edges = step(threshold, delta);

	if(dot(edges, vec2(1.0)) == 0.0) {

		discard;

	}

	gl_FragColor = vec4(edges, 0.0, 1.0);

}
