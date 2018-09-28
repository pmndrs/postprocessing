uniform sampler2D inputBuffer;

varying vec2 vUv;
varying vec4 vOffset[3];

void main() {

	const vec2 threshold = vec2(EDGE_THRESHOLD);

	// Calculate color deltas.
	vec4 delta;
	vec3 c = texture2D(inputBuffer, vUv).rgb;

	vec3 cLeft = texture2D(inputBuffer, vOffset[0].xy).rgb;
	vec3 t = abs(c - cLeft);
	delta.x = max(max(t.r, t.g), t.b);

	vec3 cTop = texture2D(inputBuffer, vOffset[0].zw).rgb;
	t = abs(c - cTop);
	delta.y = max(max(t.r, t.g), t.b);

	// We do the usual threshold.
	vec2 edges = step(threshold, delta.xy);

	// Then discard if there is no edge.
	if(dot(edges, vec2(1.0)) == 0.0) {

		discard;

	}

	// Calculate right and bottom deltas.
	vec3 cRight = texture2D(inputBuffer, vOffset[1].xy).rgb;
	t = abs(c - cRight);
	delta.z = max(max(t.r, t.g), t.b);

	vec3 cBottom = texture2D(inputBuffer, vOffset[1].zw).rgb;
	t = abs(c - cBottom);
	delta.w = max(max(t.r, t.g), t.b);

	// Calculate the maximum delta in the direct neighborhood.
	float maxDelta = max(max(max(delta.x, delta.y), delta.z), delta.w);

	// Calculate left-left and top-top deltas.
	vec3 cLeftLeft = texture2D(inputBuffer, vOffset[2].xy).rgb;
	t = abs(c - cLeftLeft);
	delta.z = max(max(t.r, t.g), t.b);

	vec3 cTopTop = texture2D(inputBuffer, vOffset[2].zw).rgb;
	t = abs(c - cTopTop);
	delta.w = max(max(t.r, t.g), t.b);

	// Calculate the final maximum delta.
	maxDelta = max(max(maxDelta, delta.z), delta.w);

	// Local contrast adaptation in action.
	edges.xy *= step(0.5 * maxDelta, delta.xy);

	gl_FragColor = vec4(edges, 0.0, 0.0);

}
