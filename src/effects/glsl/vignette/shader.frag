uniform float offset;
uniform float darkness;

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {

	const vec2 center = vec2(0.5);

	#ifdef ESKIL

		vec2 coord = (uv - center) * vec2(offset);
		color = mix(color.rgb, vec3(1.0 - darkness), dot(coord, coord));

	#else

		float dist = distance(uv, center);
		color *= smoothstep(0.8, offset * 0.799, dist * (darkness + offset));

	#endif

	outputColor = vec4(color, 1.0);

}
