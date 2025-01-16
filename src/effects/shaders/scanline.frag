uniform vec2 params;

#ifdef SCROLL

	uniform float scrollSpeed;

#endif

vec4 mainImage(const in vec4 inputColor, const in vec2 uv, const in GData gData) {

	float y = uv.y + params.x;

	#ifdef SCROLL

		y += time * scrollSpeed;

	#endif

	float f = y * params.y;
	vec2 sl = vec2(sin(f), cos(f));

	return vec4(sl.xyx, inputColor.a);

}
