uniform lowp sampler2D weightMap;

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

vec4 smaa(sampler2D inputBuffer, const in vec4 inputColor, const in vec2 uv) {

	// Fetch the blending weights for the current pixel.
	vec4 a;
	a.x = textureOffset(weightMap, uv, ivec2(1, 0)).a;
	a.y = textureOffset(weightMap, uv, ivec2(0, 1)).g;
	a.wz = texture(weightMap, uv).rb;

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
		vec4 blendingCoord = blendingOffset * vec4(resolution.zw, -resolution.zw) + uv.xyxy;

		// Rely on bilinear filtering to mix the current pixel with the neighbor.
		color = blendingWeight.x * texture(inputBuffer, blendingCoord.xy);
		color += blendingWeight.y * texture(inputBuffer, blendingCoord.zw);

	}

	return color;

}

vec4 mainImage(const in vec4 inputColor, const in vec2 uv, const in GData gData) {

	return smaa(gBuffer.color, inputColor, uv);

}
