#ifdef ASPECT_CORRECTION

	uniform float scale;

#else

	uniform mat3 uvTransform;

#endif

varying vec2 vUv2;

void mainSupport(const in vec2 uv) {

	#ifdef ASPECT_CORRECTION

		vUv2 = uv * vec2(aspect, 1.0) * scale;

	#else

		vUv2 = (uvTransform * vec3(uv, 1.0)).xy;

	#endif

}
