#ifdef RADIAL_MODULATION

	uniform float modulationOffset;

#endif

varying float vActive;
varying vec2 vUvR;
varying vec2 vUvB;

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {

	vec2 ra = inputColor.ra;
	vec2 ba = inputColor.ba;

	#ifdef RADIAL_MODULATION

		const vec2 center = vec2(0.5);
		float d = distance(uv, center) * 2.0;
		d = max(d - modulationOffset, 0.0);

		if(vActive > 0.0 && d > 0.0) {

			ra = texture2D(inputBuffer, mix(uv, vUvR, d)).ra;
			ba = texture2D(inputBuffer, mix(uv, vUvB, d)).ba;

		}

	#else

		if(vActive > 0.0) {

			ra = texture2D(inputBuffer, vUvR).ra;
			ba = texture2D(inputBuffer, vUvB).ba;

		}

	#endif

	outputColor = vec4(ra.x, inputColor.g, ba.x, max(max(ra.y, ba.y), inputColor.a));

}
