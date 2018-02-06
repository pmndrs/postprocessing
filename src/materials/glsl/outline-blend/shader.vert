#ifdef USE_PATTERN

	uniform float aspect;
	uniform float patternScale;
	varying vec2 vPatternCoord;

#endif

varying vec2 vUv;

void main() {

	#ifdef USE_PATTERN

		vec2 aspectCorrection = vec2(aspect, 1.0);
		vPatternCoord = uv * aspectCorrection * patternScale;

	#endif

	vUv = uv;

	gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);

}
