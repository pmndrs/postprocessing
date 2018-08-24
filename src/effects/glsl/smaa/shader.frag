uniform sampler2D weightMap;
varying vec4 vOffset;

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {

	// Fetch the blending weights for the current pixel.
	vec4 a;
	a.xz = texture2D(weightMap, uv).xz;
	a.y = texture2D(weightMap, vOffset.zw).g;
	a.w = texture2D(weightMap, vOffset.xy).a;

	vec4 color = inputColor;

	// Ignore tiny blending weights.
	if(dot(a, vec4(1.0)) >= 1e-5) {

		/* Up to four lines can be crossing a pixel (one through each edge).
		 * The line with the maximum weight for each direction is favoured.
		 */

		vec2 offset = vec2(
			a.a > a.b ? a.a : -a.b,	// Left vs. right.
			a.g > a.r ? -a.g : a.r	// Top vs. bottom (changed signs).
		);

		// Go in the direction with the maximum weight (horizontal vs. vertical).
		if(abs(offset.x) > abs(offset.y)) {

			offset.y = 0.0;

		} else {

			offset.x = 0.0;

		}

		// Fetch the opposite color and lerp by hand.
		vec4 oppositeColor = texture2D(inputBuffer, uv + sign(offset) * texelSize);
		float s = abs(offset.x) > abs(offset.y) ? abs(offset.x) : abs(offset.y);

		// Gamma correction.
		color.rgb = pow(abs(color.rgb), vec3(2.2));
		oppositeColor.rgb = pow(abs(oppositeColor.rgb), vec3(2.2));
		color = mix(color, oppositeColor, s);
		color.rgb = pow(abs(color.rgb), vec3(1.0 / 2.2));

	}

	outputColor = color;

}
