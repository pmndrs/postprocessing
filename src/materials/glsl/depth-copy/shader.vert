varying vec2 vUv;

#if DEPTH_COPY_MODE == 1

	uniform vec2 screenPosition;

#endif

void main() {

	#if DEPTH_COPY_MODE == 1

		vUv = screenPosition;

	#else

		vUv = position.xy * 0.5 + 0.5;

	#endif

	gl_Position = vec4(position.xy, 1.0, 1.0);

}
