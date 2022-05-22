uniform float offset;
uniform float darkness;

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {

	const vec2 center = vec2(0.5);
	vec3 color = inputColor.rgb;

	#if VIGNETTE_TECHNIQUE == 0

		float d = distance(uv, center);
		color *= smoothstep(0.8, offset * 0.799, d * (darkness + offset));

	#else

		vec2 coord = (uv - center) * vec2(offset);
		color = mix(color, vec3(1.0 - darkness), dot(coord, coord));

	#endif

	outputColor = vec4(color, inputColor.a);

}
