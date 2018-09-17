uniform sampler2D inputBuffer;
uniform sampler2D weightMap;

uniform vec2 texelSize;

varying vec2 vUv;
varying vec4 vOffset;

void main() {

	// Fetch the blending weights for current pixel.
	vec4 a;
	a.xz = texture2D(weightMap, vUv).xz;
	a.y = texture2D(weightMap, vOffset.zw).g;
	a.w = texture2D(weightMap, vOffset.xy).a;

	vec4 color;

	// Check if there is any blending weight with a value greater than 0.0.
	if(dot(a, vec4(1.0)) < 1e-5) {

		color = texture2D(inputBuffer, vUv, 0.0);

	} else {

		/* Up to four lines can be crossing a pixel (one through each edge).
		 * The line with the maximum weight for each direction is favoured.
		 */

		vec2 offset;
		offset.x = a.a > a.b ? a.a : -a.b; // Left vs. right.
		offset.y = a.g > a.r ? -a.g : a.r; // Top vs. bottom (changed signs).

		// Go in the direction with the maximum weight (horizontal vs. vertical).
		if(abs(offset.x) > abs(offset.y)) {

			offset.y = 0.0;

		} else {

			offset.x = 0.0;

		}

		// Fetch the opposite color and lerp by hand.
		color = texture2D(inputBuffer, vUv, 0.0);
		vec2 coord = vUv + sign(offset) * texelSize;
		vec4 oppositeColor = texture2D(inputBuffer, coord, 0.0);
		float s = abs(offset.x) > abs(offset.y) ? abs(offset.x) : abs(offset.y);

		// Gamma correction.
		color.rgb = pow(abs(color.rgb), vec3(2.2));
		oppositeColor.rgb = pow(abs(oppositeColor.rgb), vec3(2.2));
		color = mix(color, oppositeColor, s);
		color.rgb = pow(abs(color.rgb), vec3(1.0 / 2.2));

	}

	gl_FragColor = color;

}
