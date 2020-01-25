uniform sampler2D depthBuffer;

varying vec2 vUv;

varying vec2 vUv0;
varying vec2 vUv1;

/**
 * Gathers the current texel, and the top-left neighbors.
 */

vec3 gatherNeighbors() {

	float p = texture2D(depthBuffer, vUv).r;
	float pLeft = texture2D(depthBuffer, vUv0).r;
	float pTop = texture2D(depthBuffer, vUv1).r;

	return vec3(p, pLeft, pTop);

}

void main() {

	const vec2 threshold = vec2(DEPTH_THRESHOLD);

	vec3 neighbours = gatherNeighbors();
	vec2 delta = abs(neighbours.xx - vec2(neighbours.y, neighbours.z));
	vec2 edges = step(threshold, delta);

	if(dot(edges, vec2(1.0)) == 0.0) {

		discard;

	}

	gl_FragColor = vec4(edges, 0.0, 1.0);

}
