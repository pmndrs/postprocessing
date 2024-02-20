uniform float count;

#ifdef SCROLL

	uniform float scrollSpeed;

#endif

vec4 mainImage(const in vec4 inputColor, const in vec2 uv, const in GData gData) {

	float y = uv.y;

	#ifdef SCROLL

		y += time * scrollSpeed;

	#endif

	vec2 sl = vec2(sin(y * count), cos(y * count));

	return vec4(sl.xyx, inputColor.a);

}