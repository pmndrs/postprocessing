vec4 mainImage(const in vec4 inputColor, const in vec2 uv, const in GData gData) {

	vec3 noise = vec3(rand(uv * (1.0 + time)));

	#ifdef PREMULTIPLY

		return vec4(min(inputColor.rgb * noise, vec3(1.0)), inputColor.a);

	#else

		return vec4(noise, inputColor.a);

	#endif

}