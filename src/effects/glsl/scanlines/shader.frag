uniform float count;

#ifdef SCROLL

	uniform float scrollSpeed;

#endif

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {

	float y = uv.y;

	#ifdef SCROLL

		y += time * scrollSpeed;

	#endif

	vec2 sl = vec2(sin(y * count), cos(y * count));
	outputColor = vec4(sl.xyx, inputColor.a);

}
