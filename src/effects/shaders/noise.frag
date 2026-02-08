uniform float page;

vec4 mainImage(const in vec4 inputColor, const in vec2 uv, const in GData gData) {

	vec3 p = vec3(uv, SEED + page);

	#ifdef RGB

		vec3 pR = p;
		vec3 pG = vec3(p.x + 1.0, p.y, p.z);
		vec3 pB = vec3(p.x, p.y + 1.0, p.z);

		vec3 noise = vec3(urand(pR), urand(pG), urand(pB));

	#else

		vec3 noise = vec3(urand(p));

	#endif

	#ifdef PREMULTIPLY

		noise *= inputColor.rgb;

	#endif

	return vec4(noise, inputColor.a);

}
