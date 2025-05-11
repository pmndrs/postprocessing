uniform float page;

vec4 mainImage(const in vec4 inputColor, const in vec2 uv, const in GData gData) {

	vec2 p = uv * (SEED + page);

	#ifdef RGB

		vec2 pR = p;
		vec2 pG = vec2(p.x + 1.0, p.y);
		vec2 pB = vec2(p.x, p.y + 1.0);

		vec3 noise = vec3(rand(pR), rand(pG), rand(pB));

	#else

		vec3 noise = vec3(rand(p));

	#endif

	#ifdef PREMULTIPLY

		noise *= inputColor.rgb;

	#endif

	return vec4(noise, inputColor.a);

}
