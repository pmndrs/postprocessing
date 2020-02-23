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

	// Calculate color deltas.
	vec4 delta;
	vec3 c = texture2D(inputBuffer, vUv).rgb;

	vec3 cLeft = texture2D(inputBuffer, vUv0).rgb;
	vec3 t = abs(c - cLeft);
	delta.x = max(max(t.r, t.g), t.b);

	vec3 cTop = texture2D(inputBuffer, vUv1).rgb;
	t = abs(c - cTop);
	delta.y = max(max(t.r, t.g), t.b);

	// Use a threshold to detect significant color edges.
	vec2 edges = step(threshold, delta.xy);

	// Discard if there is no edge.
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

}
