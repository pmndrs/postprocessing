uniform sampler2D tDiffuse;
uniform sampler2D tWeights;

uniform vec2 texelSize;

varying vec2 vUv;
varying vec4 vOffset;

void main() {

	// Fetch the blending weights for current pixel.
	vec4 a;
	a.xz = texture2D(tWeights, vUv).xz;
	a.y = texture2D(tWeights, vOffset.zw).g;
	a.w = texture2D(tWeights, vOffset.xy).a;

	vec4 color;

	// Check if there is any blending weight with a value greater than 0.0.
	if(dot(a, vec4(1.0)) < 1e-5) {

		color = texture2D(tDiffuse, vUv, 0.0);

	} else {

		/* Up to four lines can be crossing a pixel (one through each edge). We favor
		 * blending by choosing the line with the maximum weight for each direction.
		 */

		vec2 offset;
		offset.x = a.a > a.b ? a.a : -a.b; // Left vs. right.
		offset.y = a.g > a.r ? -a.g : a.r; // Top vs. bottom (changed signs).

		// Then we go in the direction that has the maximum weight (horizontal vs. vertical).
		if(abs(offset.x) > abs(offset.y)) {

			offset.y = 0.0;

		} else {

			offset.x = 0.0;

		}

		// Fetch the opposite color and lerp by hand.
		color = texture2D(tDiffuse, vUv, 0.0);
		vec2 coord = vUv + sign(offset) * texelSize;
		vec4 oppositeColor = texture2D(tDiffuse, coord, 0.0);
		float s = abs(offset.x) > abs(offset.y) ? abs(offset.x) : abs(offset.y);

		// Gamma correction.
		color.rgb = pow(abs(color.rgb), vec3(2.2));
		oppositeColor.rgb = pow(abs(oppositeColor.rgb), vec3(2.2));
		color = mix(color, oppositeColor, s);
		color.rgb = pow(abs(color.rgb), vec3(1.0 / 2.2));

	}

	gl_FragColor = color;

}
