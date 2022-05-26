#define sampleLevelZeroOffset(t, coord, offset) texture2D(t, coord + offset * texelSize)

#if __VERSION__ < 300

	#define round(v) floor(v + 0.5)

#endif

#ifdef FRAMEBUFFER_PRECISION_HIGH

	uniform mediump sampler2D inputBuffer;

#else

	uniform lowp sampler2D inputBuffer;

#endif

uniform lowp sampler2D areaTexture;
uniform lowp sampler2D searchTexture;

uniform vec2 texelSize;
uniform vec2 resolution;

varying vec2 vUv;
varying vec4 vOffset[3];
varying vec2 vPixCoord;


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

/**
 * Allows to decode two binary values from a bilinear-filtered access.
 *
 * Bilinear access for fetching 'e' have a 0.25 offset, and we are interested
 * in the R and G edges:
 *
 * +---G---+-------+
 * |   x o R   x   |
 * +-------+-------+
 *
 * Then, if one of these edge is enabled:
 *  Red: (0.75 * X + 0.25 * 1) => 0.25 or 1.0
 *  Green: (0.75 * 1 + 0.25 * X) => 0.75 or 1.0
 *
 * This function will unpack the values (mad + mul + round):
 * wolframalpha.com: round(x * abs(5 * x - 5 * 0.75)) plot 0 to 1
 */

vec2 decodeDiagBilinearAccess(in vec2 e) {

	e.r = e.r * abs(5.0 * e.r - 5.0 * 0.75);

	return round(e);

}

vec4 decodeDiagBilinearAccess(in vec4 e) {

	e.rb = e.rb * abs(5.0 * e.rb - 5.0 * 0.75);

	return round(e);

}

/**
 * Diagonal pattern searches.
 */

vec2 searchDiag1(const in vec2 texCoord, const in vec2 dir, out vec2 e) {

	vec4 coord = vec4(texCoord, -1.0, 1.0);
	vec3 t = vec3(texelSize, 1.0);

	for(int i = 0; i < MAX_SEARCH_STEPS_INT; ++i) {

		if(!(coord.z < float(MAX_SEARCH_STEPS_DIAG_INT - 1) && coord.w > 0.9)) {

			break;

		}

		coord.xyz = t * vec3(dir, 1.0) + coord.xyz;
		e = texture2D(inputBuffer, coord.xy).rg;
		coord.w = dot(e, vec2(0.5));

	}

	return coord.zw;

}

vec2 searchDiag2(const in vec2 texCoord, const in vec2 dir, out vec2 e) {

	vec4 coord = vec4(texCoord, -1.0, 1.0);
	coord.x += 0.25 * texelSize.x; // See @SearchDiag2Optimization
	vec3 t = vec3(texelSize, 1.0);

	for(int i = 0; i < MAX_SEARCH_STEPS_INT; ++i) {

		if(!(coord.z < float(MAX_SEARCH_STEPS_DIAG_INT - 1) && coord.w > 0.9)) {

			break;

		}

		coord.xyz = t * vec3(dir, 1.0) + coord.xyz;

		// @SearchDiag2Optimization
		// Fetch both edges at once using bilinear filtering.
		e = texture2D(inputBuffer, coord.xy).rg;
		e = decodeDiagBilinearAccess(e);

		// Non-optimized version:
		// e.g = texture2D(inputBuffer, coord.xy).g;
		// e.r = SMAASampleLevelZeroOffset(inputBuffer, coord.xy, vec2(1, 0)).r;

		coord.w = dot(e, vec2(0.5));

	}

	return coord.zw;

}

/**
 * Calculates the area corresponding to a certain diagonal distance and crossing
 * edges 'e'.
 */

vec2 areaDiag(const in vec2 dist, const in vec2 e, const in float offset) {

	vec2 texCoord = vec2(AREATEX_MAX_DISTANCE_DIAG, AREATEX_MAX_DISTANCE_DIAG) * e + dist;

	// Apply a scale and bias for mapping to texel space.
	texCoord = AREATEX_PIXEL_SIZE * texCoord + 0.5 * AREATEX_PIXEL_SIZE;

	// Diagonal areas are on the second half of the texture.
	texCoord.x += 0.5;

	// Move to the proper place, according to the subpixel offset.
	texCoord.y += AREATEX_SUBTEX_SIZE * offset;

	return texture2D(areaTexture, texCoord).rg;

}

/**
 * Searches for diagonal patterns and returns the corresponding weights.
 */

vec2 calculateDiagWeights(const in vec2 texCoord, const in vec2 e, const in vec4 subsampleIndices) {

	vec2 weights = vec2(0.0);

	// Search for the line ends.
	vec4 d;
	vec2 end;

	if(e.r > 0.0) {

		d.xz = searchDiag1(texCoord, vec2(-1.0,  1.0), end);
		d.x += float(end.y > 0.9);

	} else {

		d.xz = vec2(0.0);

	}

	d.yw = searchDiag1(texCoord, vec2(1.0, -1.0), end);

	if(d.x + d.y > 2.0) { // d.x + d.y + 1 > 3

		// Fetch the crossing edges.
		vec4 coords = vec4(-d.x + 0.25, d.x, d.y, -d.y - 0.25) * texelSize.xyxy + texCoord.xyxy;
		vec4 c;
		c.xy = sampleLevelZeroOffset(inputBuffer, coords.xy, vec2(-1, 0)).rg;
		c.zw = sampleLevelZeroOffset(inputBuffer, coords.zw, vec2(1, 0)).rg;
		c.yxwz = decodeDiagBilinearAccess(c.xyzw);

		// Non-optimized version:
		// vec4 coords = vec4(-d.x, d.x, d.y, -d.y) * texelSize.xyxy + texCoord.xyxy;
		// vec4 c;
		// c.x = sampleLevelZeroOffset(inputBuffer, coords.xy, vec2(-1, 0)).g;
		// c.y = sampleLevelZeroOffset(inputBuffer, coords.xy, vec2(0, 0)).r;
		// c.z = sampleLevelZeroOffset(inputBuffer, coords.zw, vec2(1, 0)).g;
		// c.w = sampleLevelZeroOffset(inputBuffer, coords.zw, vec2(1, -1)).r;

		// Merge crossing edges at each side into a single value.
		vec2 cc = vec2(2.0) * c.xz + c.yw;

		// Remove the crossing edge if no end of the line could be found.
		movec(bvec2(step(0.9, d.zw)), cc, vec2(0.0));

		// Fetch the areas for this line.
		weights += areaDiag(d.xy, cc, subsampleIndices.z);

	}

	// Search for the line ends.
	d.xz = searchDiag2(texCoord, vec2(-1.0, -1.0), end);

	if(sampleLevelZeroOffset(inputBuffer, texCoord, vec2(1, 0)).r > 0.0) {

		d.yw = searchDiag2(texCoord, vec2(1.0), end);
		d.y += float(end.y > 0.9);

	} else {

		d.yw = vec2(0.0);

	}

	if(d.x + d.y > 2.0) { // d.x + d.y + 1 > 3

		// Fetch the crossing edges.
		vec4 coords = vec4(-d.x, -d.x, d.y, d.y) * texelSize.xyxy + texCoord.xyxy;
		vec4 c;
		c.x = sampleLevelZeroOffset(inputBuffer, coords.xy, vec2(-1, 0)).g;
		c.y = sampleLevelZeroOffset(inputBuffer, coords.xy, vec2(0, -1)).r;
		c.zw = sampleLevelZeroOffset(inputBuffer, coords.zw, vec2(1, 0)).gr;
		vec2 cc = vec2(2.0) * c.xz + c.yw;

		// Remove the crossing edge if no end of the line could be found.
		movec(bvec2(step(0.9, d.zw)), cc, vec2(0.0));

		// Fetch the areas for this line.
		weights += areaDiag(d.xy, cc, subsampleIndices.w).gr;

	}

	return weights;

}

/**
 * Determines how much length should be added in the last step of the searches.
 *
 * Takes the bilinearly interpolated edge (see @PSEUDO_GATHER4), and adds 0, 1
 * or 2 depending on which edges and crossing edges are active.
 */

float searchLength(const in vec2 e, const in float offset) {

	/* The texture is flipped vertically, with left and right cases taking half
	of the space horizontally. */
	vec2 scale = SEARCHTEX_SIZE * vec2(0.5, -1.0);
	vec2 bias = SEARCHTEX_SIZE * vec2(offset, 1.0);

	// Scale and bias to access texel centers.
	scale += vec2(-1.0, 1.0);
	bias += vec2(0.5, -0.5);

	// Convert from pixel coordinates to texcoords.
	scale *= 1.0 / SEARCHTEX_PACKED_SIZE;
	bias *= 1.0 / SEARCHTEX_PACKED_SIZE;

	return texture2D(searchTexture, scale * e + bias).r;

}

/**
 * Horizontal search for the second pass.
 */

float searchXLeft(in vec2 texCoord, const in float end) {

	/* @PSEUDO_GATHER4
	This texCoord has been offset by (-0.25, -0.125) in the vertex shader to
	sample between edges, thus fetching four edges in a row.
	Sampling with different offsets in each direction allows to disambiguate
	which edges are active from the four fetched ones. */

	vec2 e = vec2(0.0, 1.0);

	for(int i = 0; i < MAX_SEARCH_STEPS_INT; ++i) {

		if(!(texCoord.x > end && e.g > 0.8281 && e.r == 0.0)) {

			break;

		}

		e = texture2D(inputBuffer, texCoord).rg;
		texCoord = vec2(-2.0, 0.0) * texelSize + texCoord;

	}

	float offset = -(255.0 / 127.0) * searchLength(e, 0.0) + 3.25;

	return texelSize.x * offset + texCoord.x;

	// Non-optimized version:
	// Correct the previous (-0.25, -0.125) offset.
	// texCoord.x += 0.25 * texelSize.x;
	// The searches are biased by 1, so adjust the coords accordingly.
	// texCoord.x += texelSize.x;
	// Disambiguate the length added by the last step.
	// texCoord.x += 2.0 * texelSize.x; // Undo last step.
	// texCoord.x -= texelSize.x * (255.0 / 127.0) * searchLength(e, 0.0);
	// return texelSize.x * offset + texCoord.x);

}

float searchXRight(vec2 texCoord, const in float end) {

	vec2 e = vec2(0.0, 1.0);

	for(int i = 0; i < MAX_SEARCH_STEPS_INT; ++i) {

		if(!(texCoord.x < end && e.g > 0.8281 && e.r == 0.0)) {

			break;

		}

		e = texture2D(inputBuffer, texCoord).rg;
		texCoord = vec2(2.0, 0.0) * texelSize.xy + texCoord;

	}

	float offset = -(255.0 / 127.0) * searchLength(e, 0.5) + 3.25;

	return -texelSize.x * offset + texCoord.x;

}

/**
 * Vertical search for the second pass.
 */

float searchYUp(vec2 texCoord, const in float end) {

	vec2 e = vec2(1.0, 0.0);

	for(int i = 0; i < MAX_SEARCH_STEPS_INT; ++i) {

		if(!(texCoord.y > end && e.r > 0.8281 && e.g == 0.0)) {

			break;

		}

		e = texture2D(inputBuffer, texCoord).rg;
		texCoord = -vec2(0.0, 2.0) * texelSize.xy + texCoord;

	}

	float offset = -(255.0 / 127.0) * searchLength(e.gr, 0.0) + 3.25;

	return texelSize.y * offset + texCoord.y;

}

float searchYDown(vec2 texCoord, const in float end) {

	vec2 e = vec2(1.0, 0.0);

	for(int i = 0; i < MAX_SEARCH_STEPS_INT; i++) {

		if(!(texCoord.y < end && e.r > 0.8281 && e.g == 0.0)) {

			break;

		}

		e = texture2D(inputBuffer, texCoord).rg;
		texCoord = vec2(0.0, 2.0) * texelSize.xy + texCoord;

	}

	float offset = -(255.0 / 127.0) * searchLength(e.gr, 0.5) + 3.25;

	return -texelSize.y * offset + texCoord.y;

}

/**
 * Determines the areas at each side of the current edge.
 */

vec2 area(const in vec2 dist, const in float e1, const in float e2, const in float offset) {

	// Rounding prevents precision errors of bilinear filtering.
	vec2 texCoord = vec2(AREATEX_MAX_DISTANCE) * round(4.0 * vec2(e1, e2)) + dist;

	// Apply a scale and bias for mapping to texel space.
	texCoord = AREATEX_PIXEL_SIZE * texCoord + 0.5 * AREATEX_PIXEL_SIZE;

	// Move to the proper place, according to the subpixel offset.
	texCoord.y = AREATEX_SUBTEX_SIZE * offset + texCoord.y;

	return texture2D(areaTexture, texCoord).rg;

}

/**
 * Corner detection.
 */

void detectHorizontalCornerPattern(inout vec2 weights, const in vec4 texCoord, const in vec2 d) {

	#if !defined(DISABLE_CORNER_DETECTION)

		vec2 leftRight = step(d.xy, d.yx);
		vec2 rounding = (1.0 - CORNER_ROUNDING_NORM) * leftRight;

		// Reduce blending for pixels in the center of a line.
		rounding /= leftRight.x + leftRight.y;

		vec2 factor = vec2(1.0);
		factor.x -= rounding.x * sampleLevelZeroOffset(inputBuffer, texCoord.xy, vec2(0, 1)).r;
		factor.x -= rounding.y * sampleLevelZeroOffset(inputBuffer, texCoord.zw, vec2(1, 1)).r;
		factor.y -= rounding.x * sampleLevelZeroOffset(inputBuffer, texCoord.xy, vec2(0, -2)).r;
		factor.y -= rounding.y * sampleLevelZeroOffset(inputBuffer, texCoord.zw, vec2(1, -2)).r;

		weights *= clamp(factor, 0.0, 1.0);

	#endif

}

void detectVerticalCornerPattern(inout vec2 weights, const in vec4 texCoord, const in vec2 d) {

	#if !defined(DISABLE_CORNER_DETECTION)

		vec2 leftRight = step(d.xy, d.yx);
		vec2 rounding = (1.0 - CORNER_ROUNDING_NORM) * leftRight;

		rounding /= leftRight.x + leftRight.y;

		vec2 factor = vec2(1.0);
		factor.x -= rounding.x * sampleLevelZeroOffset(inputBuffer, texCoord.xy, vec2(1, 0)).g;
		factor.x -= rounding.y * sampleLevelZeroOffset(inputBuffer, texCoord.zw, vec2(1, 1)).g;
		factor.y -= rounding.x * sampleLevelZeroOffset(inputBuffer, texCoord.xy, vec2(-2, 0)).g;
		factor.y -= rounding.y * sampleLevelZeroOffset(inputBuffer, texCoord.zw, vec2(-2, 1)).g;

		weights *= clamp(factor, 0.0, 1.0);

	#endif

}

void main() {

	vec4 weights = vec4(0.0);
	vec4 subsampleIndices = vec4(0.0);
	vec2 e = texture2D(inputBuffer, vUv).rg;

	if(e.g > 0.0) {

		// Edge at north.

		#if !defined(DISABLE_DIAG_DETECTION)

			/* Diagonals have both north and west edges, so searching for them in one of
			the boundaries is enough. */
			weights.rg = calculateDiagWeights(vUv, e, subsampleIndices);

			// Skip horizontal/vertical processing if there is a diagonal.
			if(weights.r == -weights.g) { // weights.r + weights.g == 0.0

		#endif

		vec2 d;

		// Find the distance to the left.
		vec3 coords;
		coords.x = searchXLeft(vOffset[0].xy, vOffset[2].x);
		coords.y = vOffset[1].y; // vOffset[1].y = vUv.y - 0.25 * texelSize.y (@CROSSING_OFFSET)
		d.x = coords.x;

		/* Now fetch the left crossing edges, two at a time using bilinear
		filtering. Sampling at -0.25 (see @CROSSING_OFFSET) enables to discern what
		value each edge has. */
		float e1 = texture2D(inputBuffer, coords.xy).r;

		// Find the distance to the right.
		coords.z = searchXRight(vOffset[0].zw, vOffset[2].y);
		d.y = coords.z;

		/* Translate distances to pixel units for better interleave arithmetic and
		memory accesses. */
		d = round(resolution.xx * d + -vPixCoord.xx);

		// The area texture is compressed quadratically.
		vec2 sqrtD = sqrt(abs(d));

		// Fetch the right crossing edges.
		float e2 = sampleLevelZeroOffset(inputBuffer, coords.zy, vec2(1, 0)).r;

		// Pattern recognized, now get the actual area.
		weights.rg = area(sqrtD, e1, e2, subsampleIndices.y);

		// Fix corners.
		coords.y = vUv.y;
		detectHorizontalCornerPattern(weights.rg, coords.xyzy, d);

		#if !defined(DISABLE_DIAG_DETECTION)

			} else {

				// Skip vertical processing.
				e.r = 0.0;

			}

		#endif

	}

	if(e.r > 0.0) {

		// Edge at west.

		vec2 d;

		// Find the distance to the top.
		vec3 coords;
		coords.y = searchYUp(vOffset[1].xy, vOffset[2].z);
		coords.x = vOffset[0].x; // vOffset[1].x = vUv.x - 0.25 * texelSize.x;
		d.x = coords.y;

		// Fetch the top crossing edges.
		float e1 = texture2D(inputBuffer, coords.xy).g;

		// Find the distance to the bottom.
		coords.z = searchYDown(vOffset[1].zw, vOffset[2].w);
		d.y = coords.z;

		// Translate distances into pixel units.
		d = round(resolution.yy * d - vPixCoord.yy);

		// The area texture is compressed quadratically.
		vec2 sqrtD = sqrt(abs(d));

		// Fetch the bottom crossing edges.
		float e2 = sampleLevelZeroOffset(inputBuffer, coords.xz, vec2(0, 1)).g;

		// Get the area for this direction.
		weights.ba = area(sqrtD, e1, e2, subsampleIndices.x);

		// Fix corners.
		coords.x = vUv.x;
		detectVerticalCornerPattern(weights.ba, coords.xyxz, d);

	}

	gl_FragColor = weights;

}
