/**
 * FXAA 3.11 by Timothy Lottes
 *
 * Copyright (c) 2011, NVIDIA CORPORATION. All rights reserved.
 *
 * TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, THIS SOFTWARE IS PROVIDED "AS IS" AND NVIDIA AND ITS SUPPLIERS
 * DISCLAIM ALL WARRANTIES, EITHER EXPRESS OR IMPLIED, INCLUDING, BUT NOT LIMITED TO, IMPLIED WARRANTIES OF
 * MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE. IN NO EVENT SHALL NVIDIA OR ITS SUPPLIERS BE LIABLE FOR ANY
 * SPECIAL, INCIDENTAL, INDIRECT, OR CONSEQUENTIAL DAMAGES WHATSOEVER (INCLUDING, WITHOUT LIMITATION, DAMAGES FOR LOSS
 * OF BUSINESS PROFITS, BUSINESS INTERRUPTION, LOSS OF BUSINESS INFORMATION, OR ANY OTHER PECUNIARY LOSS) ARISING OUT OF
 * THE USE OF OR INABILITY TO USE THIS SOFTWARE, EVEN IF NVIDIA HAS BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.
 */

#define QUALITY(q) ((q) < 5 ? 1.0 : ((q) > 5 ? ((q) < 10 ? 2.0 : ((q) < 11 ? 4.0 : 8.0)) : 1.5))
#define ONE_OVER_TWELVE 0.08333333333333333

varying vec2 vUvDown;
varying vec2 vUvUp;
varying vec2 vUvLeft;
varying vec2 vUvRight;

varying vec2 vUvDownLeft;
varying vec2 vUvUpRight;
varying vec2 vUvUpLeft;
varying vec2 vUvDownRight;

vec4 fxaa(const in vec4 inputColor, const in vec2 uv) {

	// Luma at the current fragment.
	float lumaCenter = luminance(inputColor.rgb);

	// Luma at the four direct neighbours of the current fragment.
	float lumaDown = luminance(texture2D(inputBuffer, vUvDown).rgb);
	float lumaUp = luminance(texture2D(inputBuffer, vUvUp).rgb);
	float lumaLeft = luminance(texture2D(inputBuffer, vUvLeft).rgb);
	float lumaRight = luminance(texture2D(inputBuffer, vUvRight).rgb);

	// Find the maximum and minimum luma around the current fragment.
	float lumaMin = min(lumaCenter, min(min(lumaDown, lumaUp), min(lumaLeft, lumaRight)));
	float lumaMax = max(lumaCenter, max(max(lumaDown, lumaUp), max(lumaLeft, lumaRight)));

	// Compute the delta.
	float lumaRange = lumaMax - lumaMin;

	// Skip AA if the luma variation is lower than a threshold (low contrast or dark area).
	if(lumaRange < max(EDGE_THRESHOLD_MIN, lumaMax * EDGE_THRESHOLD_MAX)) {

		return inputColor;

	}

	// Query the 4 remaining corners lumas.
	float lumaDownLeft = luminance(texture2D(inputBuffer, vUvDownLeft).rgb);
	float lumaUpRight = luminance(texture2D(inputBuffer, vUvUpRight).rgb);
	float lumaUpLeft = luminance(texture2D(inputBuffer, vUvUpLeft).rgb);
	float lumaDownRight = luminance(texture2D(inputBuffer, vUvDownRight).rgb);

	// Combine the four edges lumas (using intermediary variables for future computations with the same values).
	float lumaDownUp = lumaDown + lumaUp;
	float lumaLeftRight = lumaLeft + lumaRight;

	// Same for corners.
	float lumaLeftCorners = lumaDownLeft + lumaUpLeft;
	float lumaDownCorners = lumaDownLeft + lumaDownRight;
	float lumaRightCorners = lumaDownRight + lumaUpRight;
	float lumaUpCorners = lumaUpRight + lumaUpLeft;

	// Compute an estimation of the gradient along the horizontal and vertical axis.
	float edgeHorizontal = (
		abs(-2.0 * lumaLeft + lumaLeftCorners) +
		abs(-2.0 * lumaCenter + lumaDownUp ) * 2.0 +
		abs(-2.0 * lumaRight + lumaRightCorners)
	);

	float edgeVertical = (
		abs(-2.0 * lumaUp + lumaUpCorners) +
		abs(-2.0 * lumaCenter + lumaLeftRight) * 2.0 +
		abs(-2.0 * lumaDown + lumaDownCorners)
	);

	// Check if the local edge is horizontal or vertical.
	bool isHorizontal = (edgeHorizontal >= edgeVertical);

	// Choose the step size (one pixel) accordingly.
	float stepLength = isHorizontal ? texelSize.y : texelSize.x;

	// Select the two neighboring texels' lumas in the opposite direction to the local edge.
	float luma1 = isHorizontal ? lumaDown : lumaLeft;
	float luma2 = isHorizontal ? lumaUp : lumaRight;

	// Compute gradients in this direction.
	float gradient1 = abs(luma1 - lumaCenter);
	float gradient2 = abs(luma2 - lumaCenter);

	// Check which direction is the steepest.
	bool is1Steepest = gradient1 >= gradient2;

	// Gradient in the corresponding direction, normalized.
	float gradientScaled = 0.25 * max(gradient1, gradient2);

	// Average luma in the correct direction.
	float lumaLocalAverage = 0.0;

	if(is1Steepest) {

		// Switch the direction.
		stepLength = -stepLength;
		lumaLocalAverage = 0.5 * (luma1 + lumaCenter);

	} else {

		lumaLocalAverage = 0.5 * (luma2 + lumaCenter);

	}

	// Shift UV in the correct direction by half a pixel.
	vec2 currentUv = uv;

	if(isHorizontal) {

		currentUv.y += stepLength * 0.5;

	} else {

		currentUv.x += stepLength * 0.5;

	}

	// Compute offset (for each iteration step) in the right direction.
	vec2 offset = isHorizontal ? vec2(texelSize.x, 0.0) : vec2(0.0, texelSize.y);

	// Compute UVs to explore on each side of the edge, orthogonally. The QUALITY allows us to step faster.
	vec2 uv1 = currentUv - offset * QUALITY(0);
	vec2 uv2 = currentUv + offset * QUALITY(0);

	// Read lumas at both extremities of the exploration segment, and compute the delta w.r.t. the local average luma.
	float lumaEnd1 = luminance(texture2D(inputBuffer, uv1).rgb);
	float lumaEnd2 = luminance(texture2D(inputBuffer, uv2).rgb);
	lumaEnd1 -= lumaLocalAverage;
	lumaEnd2 -= lumaLocalAverage;

	// If the deltas at the current extremities are larger than the local gradient, the side of the edge has been reached.
	bool reached1 = abs(lumaEnd1) >= gradientScaled;
	bool reached2 = abs(lumaEnd2) >= gradientScaled;
	bool reachedBoth = reached1 && reached2;

	// If the side has not been reached, continue to explore in this direction.
	if(!reached1) {

		uv1 -= offset * QUALITY(1);

	}

	if(!reached2) {

		uv2 += offset * QUALITY(1);

	}

	// If both sides have not been reached, continue to explore.
	if(!reachedBoth) {

		for(int i = 2; i < SAMPLES; ++i) {

			// If needed, read luma in 1st direction, compute delta.
			if(!reached1) {

				lumaEnd1 = luminance(texture2D(inputBuffer, uv1).rgb);
				lumaEnd1 = lumaEnd1 - lumaLocalAverage;

			}

			// If needed, read luma in opposite direction, compute delta.
			if(!reached2) {

				lumaEnd2 = luminance(texture2D(inputBuffer, uv2).rgb);
				lumaEnd2 = lumaEnd2 - lumaLocalAverage;

			}

			// If the deltas are larger than the local gradient, the side of the edge has been reached.
			reached1 = abs(lumaEnd1) >= gradientScaled;
			reached2 = abs(lumaEnd2) >= gradientScaled;
			reachedBoth = reached1 && reached2;
			
			// If the side has not been reached, continue to explore in this direction, with dynamic quality.
			if(!reached1) {

				uv1 -= offset * QUALITY(i);

			}

			if(!reached2) {

				uv2 += offset * QUALITY(i);

			}

			// If both sides have been reached, stop the exploration.
			if(reachedBoth) {

				break;

			}

		}

	}

	// Compute the distances to each side edge of the edge (!).
	float distance1 = isHorizontal ? (uv.x - uv1.x) : (uv.y - uv1.y);
	float distance2 = isHorizontal ? (uv2.x - uv.x) : (uv2.y - uv.y);

	// Check in which direction the side of the edge is closer.
	bool isDirection1 = distance1 < distance2;
	float distanceFinal = min(distance1, distance2);

	// Thickness of the edge.
	float edgeThickness = (distance1 + distance2);

	// Check if the luma at the center is smaller than the local average.
	bool isLumaCenterSmaller = lumaCenter < lumaLocalAverage;

	// If the luma is smaller than at its neighbour, the delta luma at each end should be positive (same variation).
	bool correctVariation1 = (lumaEnd1 < 0.0) != isLumaCenterSmaller;
	bool correctVariation2 = (lumaEnd2 < 0.0) != isLumaCenterSmaller;

	// Only keep the result in the direction of the closer side of the edge.
	bool correctVariation = isDirection1 ? correctVariation1 : correctVariation2;

	// UV offset: read in the direction of the closest side of the edge.
	float pixelOffset = -distanceFinal / edgeThickness + 0.5;

	// If the luma variation is incorrect, do not offset.
	float finalOffset = correctVariation ? pixelOffset : 0.0;

	// Sub-Pixel Shifting
	// Full weighted average of the luma over the 3x3 neighborhood.
	float lumaAverage = ONE_OVER_TWELVE * (2.0 * (lumaDownUp + lumaLeftRight) + lumaLeftCorners + lumaRightCorners);
	// Ratio of the delta between the global average and the center luma, over the luma range in the 3x3 neighborhood.
	float subPixelOffset1 = clamp(abs(lumaAverage - lumaCenter) / lumaRange, 0.0, 1.0);
	float subPixelOffset2 = (-2.0 * subPixelOffset1 + 3.0) * subPixelOffset1 * subPixelOffset1;
	// Compute a sub-pixel offset based on this delta.
	float subPixelOffsetFinal = subPixelOffset2 * subPixelOffset2 * SUBPIXEL_QUALITY;

	// Pick the biggest of the two offsets.
	finalOffset = max(finalOffset, subPixelOffsetFinal);

	// Compute the final UV coordinates.
	vec2 finalUv = uv;

	if(isHorizontal) {

		finalUv.y += finalOffset * stepLength;

	} else {

		finalUv.x += finalOffset * stepLength;

	}

	return texture2D(inputBuffer, finalUv);

}

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {

	outputColor = fxaa(inputColor, uv);

}
