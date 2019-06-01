uniform sampler2D weightMap;

varying vec2 vOffset0;
varying vec2 vOffset1;

/**
 * Moves values to a target vector based on a given conditional vector.
 */

void movec(const in bvec2 c, inout vec2 variable, const in vec2 value) {

	if(c.x) { variable.x = value.x; }
	if(c.y) { variable.y = value.y; }

}

void movec(const in bvec4 c, inout vec4 variable, const in vec4 value) {

	movec(c.xy, variable.xy, value.xy);
	movec(c.zw, variable.zw, value.zw);

}

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {

	// Fetch the blending weights for the current pixel.
	vec4 a;
	a.x = texture2D(weightMap, vOffset0).a;
	a.y = texture2D(weightMap, vOffset1).g;
	a.wz = texture2D(weightMap, uv).rb;

	vec4 color = inputColor;

	// Ignore tiny blending weights.
	if(dot(a, vec4(1.0)) >= 1e-5) {

		// max(horizontal) > max(vertical)
		bool h = max(a.x, a.z) > max(a.y, a.w);

		// Calculate the blending offsets.
		vec4 blendingOffset = vec4(0.0, a.y, 0.0, a.w);
		vec2 blendingWeight = a.yw;
		movec(bvec4(h), blendingOffset, vec4(a.x, 0.0, a.z, 0.0));
		movec(bvec2(h), blendingWeight, a.xz);
		blendingWeight /= dot(blendingWeight, vec2(1.0));

		// Calculate the texture coordinates.
		vec4 blendingCoord = blendingOffset * vec4(texelSize, -texelSize) + uv.xyxy;

		// Rely on bilinear filtering to mix the current pixel with the neighbor.
		color = blendingWeight.x * texture2D(inputBuffer, blendingCoord.xy);
		color += blendingWeight.y * texture2D(inputBuffer, blendingCoord.zw);

	}

	outputColor = color;

}
