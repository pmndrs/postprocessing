void mainImage(const in vec4 inputColor, const in vec2 uv, const in float depth, out vec4 outputColor) {

	#ifdef INVERTED

		vec3 color = vec3(1.0 - depth);

	#else

		vec3 color = vec3(depth);

	#endif

	outputColor = vec4(color, inputColor.a);

}
