#define sampleLevelZeroOffset(t, coord, offset) texture2D(t, coord + float(offset) * texelSize, 0.0)

uniform sampler2D tDiffuse;
uniform sampler2D tArea;
uniform sampler2D tSearch;

uniform vec2 texelSize;

varying vec2 vUv;
varying vec4 vOffset[3];
varying vec2 vPixCoord;

vec2 round(vec2 x) {

	return sign(x) * floor(abs(x) + 0.5);

}

float searchLength(vec2 e, float bias, float scale) {

	// Not required if tSearch accesses are set to point.
	// const vec2 SEARCH_TEX_PIXEL_SIZE = 1.0 / vec2(66.0, 33.0);
	// e = vec2(bias, 0.0) + 0.5 * SEARCH_TEX_PIXEL_SIZE + e * vec2(scale, 1.0) * vec2(64.0, 32.0) * SEARCH_TEX_PIXEL_SIZE;

	e.r = bias + e.r * scale;

	return 255.0 * texture2D(tSearch, e, 0.0).r;

}

float searchXLeft(vec2 texCoord, float end) {

	/* @PSEUDO_GATHER4
	 * This texCoord has been offset by (-0.25, -0.125) in the vertex shader to
	 * sample between edge, thus fetching four edges in a row.
	 * Sampling with different offsets in each direction allows to disambiguate
	 * which edges are active from the four fetched ones.
	 */

	vec2 e = vec2(0.0, 1.0);

	for(int i = 0; i < SMAA_MAX_SEARCH_STEPS_INT; ++i) {

		e = texture2D(tDiffuse, texCoord, 0.0).rg;
		texCoord -= vec2(2.0, 0.0) * texelSize;

		if(!(texCoord.x > end && e.g > 0.8281 && e.r == 0.0)) { break; }

	}

	// Correct the previously applied offset (-0.25, -0.125).
	texCoord.x += 0.25 * texelSize.x;

	// The searches are biased by 1, so adjust the coords accordingly.
	texCoord.x += texelSize.x;

	// Disambiguate the length added by the last step.
	texCoord.x += 2.0 * texelSize.x; // Undo last step.
	texCoord.x -= texelSize.x * searchLength(e, 0.0, 0.5);

	return texCoord.x;

}

float searchXRight(vec2 texCoord, float end) {

	vec2 e = vec2(0.0, 1.0);

	for(int i = 0; i < SMAA_MAX_SEARCH_STEPS_INT; ++i) {

		e = texture2D(tDiffuse, texCoord, 0.0).rg;
		texCoord += vec2(2.0, 0.0) * texelSize;

		if(!(texCoord.x < end && e.g > 0.8281 && e.r == 0.0)) { break; }

	}

	texCoord.x -= 0.25 * texelSize.x;
	texCoord.x -= texelSize.x;
	texCoord.x -= 2.0 * texelSize.x;
	texCoord.x += texelSize.x * searchLength(e, 0.5, 0.5);

	return texCoord.x;

}

float searchYUp(vec2 texCoord, float end) {

	vec2 e = vec2(1.0, 0.0);

	for(int i = 0; i < SMAA_MAX_SEARCH_STEPS_INT; ++i) {

		e = texture2D(tDiffuse, texCoord, 0.0).rg;
		texCoord += vec2(0.0, 2.0) * texelSize; // Changed sign.

		if(!(texCoord.y > end && e.r > 0.8281 && e.g == 0.0)) { break; }

	}

	texCoord.y -= 0.25 * texelSize.y; // Changed sign.
	texCoord.y -= texelSize.y; // Changed sign.
	texCoord.y -= 2.0 * texelSize.y; // Changed sign.
	texCoord.y += texelSize.y * searchLength(e.gr, 0.0, 0.5); // Changed sign.

	return texCoord.y;

}

float searchYDown(vec2 texCoord, float end) {

	vec2 e = vec2(1.0, 0.0);

	for(int i = 0; i < SMAA_MAX_SEARCH_STEPS_INT; ++i ) {

		e = texture2D(tDiffuse, texCoord, 0.0).rg;
		texCoord -= vec2(0.0, 2.0) * texelSize; // Changed sign.

		if(!(texCoord.y < end && e.r > 0.8281 && e.g == 0.0)) { break; }

	}

	texCoord.y += 0.25 * texelSize.y; // Changed sign.
	texCoord.y += texelSize.y; // Changed sign.
	texCoord.y += 2.0 * texelSize.y; // Changed sign.
	texCoord.y -= texelSize.y * searchLength(e.gr, 0.5, 0.5); // Changed sign.

	return texCoord.y;

}

vec2 area(vec2 dist, float e1, float e2, float offset) {

	// Rounding prevents precision errors of bilinear filtering.
	vec2 texCoord = SMAA_AREATEX_MAX_DISTANCE * round(4.0 * vec2(e1, e2)) + dist;

	// Scale and bias for texel space translation.
	texCoord = SMAA_AREATEX_PIXEL_SIZE * texCoord + (0.5 * SMAA_AREATEX_PIXEL_SIZE);

	// Move to proper place, according to the subpixel offset.
	texCoord.y += SMAA_AREATEX_SUBTEX_SIZE * offset;

	return texture2D(tArea, texCoord, 0.0).rg;

}

void main() {

	vec4 weights = vec4(0.0);
	vec4 subsampleIndices = vec4(0.0);
	vec2 e = texture2D(tDiffuse, vUv).rg;

	if(e.g > 0.0) {

		// Edge at north.
		vec2 d;

		// Find the distance to the left.
		vec2 coords;
		coords.x = searchXLeft(vOffset[0].xy, vOffset[2].x);
		coords.y = vOffset[1].y; // vOffset[1].y = vUv.y - 0.25 * texelSize.y (@CROSSING_OFFSET)
		d.x = coords.x;

		/* Now fetch the left crossing edges, two at a time using bilinear filtering.
		 * Sampling at -0.25 (see @CROSSING_OFFSET) enables to discern what value each edge has.
		 */

		float e1 = texture2D(tDiffuse, coords, 0.0).r;

		// Find the distance to the right.
		coords.x = searchXRight(vOffset[0].zw, vOffset[2].y);
		d.y = coords.x;

		// Translate distances to pixel units for better interleave arithmetic and memory accesses.
		d = d / texelSize.x - vPixCoord.x;

		// The area below needs a sqrt, as the areas texture is compressed quadratically.
		vec2 sqrtD = sqrt(abs(d));

		// Fetch the right crossing edges.
		coords.y -= texelSize.y; // WebGL port note: Added.
		float e2 = sampleLevelZeroOffset(tDiffuse, coords, ivec2(1, 0)).r;

		// Pattern recognised, now get the actual area.
		weights.rg = area(sqrtD, e1, e2, subsampleIndices.y);

	}

	if(e.r > 0.0) {

		// Edge at west.
		vec2 d;

		// Find the distance to the top.
		vec2 coords;

		coords.y = searchYUp(vOffset[1].xy, vOffset[2].z);
		coords.x = vOffset[0].x; // vOffset[1].x = vUv.x - 0.25 * texelSize.x;
		d.x = coords.y;

		// Fetch the top crossing edges.
		float e1 = texture2D(tDiffuse, coords, 0.0).g;

		// Find the distance to the bottom.
		coords.y = searchYDown(vOffset[1].zw, vOffset[2].w);
		d.y = coords.y;

		// Distances in pixel units.
		d = d / texelSize.y - vPixCoord.y;

		// The area below needs a sqrt, as the areas texture is compressed quadratically.
		vec2 sqrtD = sqrt(abs(d));

		// Fetch the bottom crossing edges.
		coords.y -= texelSize.y; // WebGL port note: Added.
		float e2 = sampleLevelZeroOffset(tDiffuse, coords, ivec2(0, 1)).g;

		// Get the area for this direction.
		weights.ba = area(sqrtD, e1, e2, subsampleIndices.x);

	}

	gl_FragColor = weights;

}
