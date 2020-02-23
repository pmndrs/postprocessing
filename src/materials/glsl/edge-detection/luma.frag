#include <common>

uniform sampler2D inputBuffer;

varying vec2 vUv;

varying vec2 vUv0;
varying vec2 vUv1;
varying vec2 vUv2;
varying vec2 vUv3;
varying vec2 vUv4;
varying vec2 vUv5;

void main() {

	const vec2 threshold = vec2(EDGE_THRESHOLD);

	float l = linearToRelativeLuminance(texture2D(inputBuffer, vUv).rgb);
	float lLeft = linearToRelativeLuminance(texture2D(inputBuffer, vUv0).rgb);
	float lTop  = linearToRelativeLuminance(texture2D(inputBuffer, vUv1).rgb);

	// Calculate luminance deltas.
	vec4 delta;
	delta.xy = abs(l - vec2(lLeft, lTop));

	// Use a threshold to detect significant color edges.
	vec2 edges = step(threshold, delta.xy);

	// Discard if there is no edge.
	if(dot(edges, vec2(1.0)) == 0.0) {

		discard;

	}

	// Calculate right and bottom deltas.
	float lRight = linearToRelativeLuminance(texture2D(inputBuffer, vUv2).rgb);
	float lBottom  = linearToRelativeLuminance(texture2D(inputBuffer, vUv3).rgb);
	delta.zw = abs(l - vec2(lRight, lBottom));

	// Calculate the maximum delta in the direct neighborhood.
	vec2 maxDelta = max(delta.xy, delta.zw);

	// Calculate left-left and top-top deltas.
	float lLeftLeft = linearToRelativeLuminance(texture2D(inputBuffer, vUv4).rgb);
	float lTopTop = linearToRelativeLuminance(texture2D(inputBuffer, vUv5).rgb);
	delta.zw = abs(vec2(lLeft, lTop) - vec2(lLeftLeft, lTopTop));

	// Calculate the final maximum delta.
	maxDelta = max(maxDelta.xy, delta.zw);
	float finalDelta = max(maxDelta.x, maxDelta.y);

	// Local contrast adaptation.
	edges.xy *= step(finalDelta, LOCAL_CONTRAST_ADAPTATION_FACTOR * delta.xy);

	gl_FragColor = vec4(edges, 0.0, 1.0);

}
