uniform sampler2D tDiffuse;
uniform float time;

varying vec2 vUv;

#ifdef NOISE

	uniform float noiseIntensity;

#endif

#ifdef SCANLINES

	uniform float scanlineIntensity;
	uniform float scanlineCount;

#endif

#ifdef GREYSCALE

	uniform vec3 luminanceCoefficients;
	uniform float greyscaleIntensity;

#elif defined(SEPIA)

	uniform float sepiaIntensity;

#endif

#ifdef VIGNETTE

	uniform float vignetteOffset;
	uniform float vignetteDarkness;

#endif

void main() {

	vec4 texel = texture2D(tDiffuse, vUv);
	vec3 color = texel.rgb;

	#ifdef SCREEN_MODE

		vec3 invColor;

	#endif

	#ifdef NOISE

		float x = vUv.x * vUv.y * time * 1000.0;
		x = mod(x, 13.0) * mod(x, 123.0);
		x = mod(x, 0.01);

		vec3 noise = texel.rgb * clamp(0.1 + x * 100.0, 0.0, 1.0) * noiseIntensity;

		#ifdef SCREEN_MODE

			invColor = vec3(1.0) - color;
			vec3 invNoise = vec3(1.0) - noise;

			color = vec3(1.0) - invColor * invNoise;

		#else

			color += noise;

		#endif

	#endif

	#ifdef SCANLINES

		vec2 sl = vec2(sin(vUv.y * scanlineCount), cos(vUv.y * scanlineCount));
		vec3 scanlines = texel.rgb * vec3(sl.x, sl.y, sl.x) * scanlineIntensity;

		#ifdef SCREEN_MODE

			invColor = vec3(1.0) - color;
			vec3 invScanlines = vec3(1.0) - scanlines;

			color = vec3(1.0) - invColor * invScanlines;

		#else

			color += scanlines;

		#endif

	#endif

	#ifdef GREYSCALE

		color = mix(color, vec3(dot(color, luminanceCoefficients)), greyscaleIntensity);

	#elif defined(SEPIA)

		vec3 c = color.rgb;

		color.r = dot(c, vec3(1.0 - 0.607 * sepiaIntensity, 0.769 * sepiaIntensity, 0.189 * sepiaIntensity));
		color.g = dot(c, vec3(0.349 * sepiaIntensity, 1.0 - 0.314 * sepiaIntensity, 0.168 * sepiaIntensity));
		color.b = dot(c, vec3(0.272 * sepiaIntensity, 0.534 * sepiaIntensity, 1.0 - 0.869 * sepiaIntensity));

	#endif

	#ifdef VIGNETTE

		const vec2 center = vec2(0.5);

		#ifdef ESKIL

			vec2 uv = (vUv - center) * vec2(vignetteOffset);
			color = mix(color.rgb, vec3(1.0 - vignetteDarkness), dot(uv, uv));

		#else

			float dist = distance(vUv, center);
			color *= smoothstep(0.8, vignetteOffset * 0.799, dist * (vignetteDarkness + vignetteOffset));

		#endif		

	#endif

	gl_FragColor = vec4(clamp(color, 0.0, 1.0), texel.a);

}
