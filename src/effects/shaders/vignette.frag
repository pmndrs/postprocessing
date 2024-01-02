uniform vec2 offsetFeather;
uniform vec3 color;

vec4 mainImage(const in vec4 inputColor, const in vec2 uv, const in GData gData) {

	const vec2 center = vec2(0.5);
	vec3 result = inputColor.rgb;

	#if VIGNETTE_TECHNIQUE == 0

		float d = distance(uv, center);
		float feather = 1.0 - offsetFeather.y;
		float factor = smoothstep(feather * 0.799, 0.8, d * (offsetFeather.x + feather));
		result = mix(result, color, factor);

	#else

		vec2 coord = (uv - center) * offsetFeather.xx;
		result = mix(result, offsetFeather.yyy * color, dot(coord, coord));

	#endif

	return vec4(result, inputColor.a);

}
