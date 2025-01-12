uniform float count;

#ifdef SCROLL

	uniform float scrollSpeed;

#endif

vec4 mainImage(const in vec4 inputColor, const in vec2 uv, const in GData gData) {

	float y = uv.y;

	#ifdef SCROLL

		y += time * scrollSpeed;

	#endif

	float f = y * count;
	vec2 sl = vec2(sin(f), cos(f));

	return vec4(sl.xyx, inputColor.a);

}
