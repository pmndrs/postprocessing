#ifdef SNOW

	float rand(const in vec2 uv) {

		const float a = 12.9898;
		const float b = 78.233;
		const float c = 43758.5453;

		float dt = dot(uv, vec2(a, b));
		float sn = mod(dt, 3.14);

		return fract(sin(sn) * c);

	}

#else

	float rand(const in vec2 uv) {

		float x = uv.x * uv.y * time * 1000.0;
		x = mod(x, 13.0) * mod(x, 123.0);
		x = mod(x, 0.01);

		return x;

	}

#endif

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {

	#ifdef SNOW

		xs = floor(gl_FragCoord.x * 2.0);
		ys = floor(gl_FragCoord.y * 2.0);

		vec3 noise = 200.0 * vec3(rand(vec2(xs * time, ys * time * 50.0)) * 0.2);

	#else

		vec3 noise = clamp(0.1 + rand(uv) * 100.0, 0.0, 1.0);

	#endif

	outputColor = vec4(noise, inputColor.a);

}
