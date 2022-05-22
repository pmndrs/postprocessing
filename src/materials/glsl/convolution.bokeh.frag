#ifdef FRAMEBUFFER_PRECISION_HIGH

	uniform mediump sampler2D inputBuffer;

#else

	uniform lowp sampler2D inputBuffer;

#endif

uniform lowp sampler2D cocBuffer;
uniform vec2 texelSize;
uniform float scale;

varying vec2 vUv;

// kernel64 and kernel16 will be injected as const arrays.

void main() {

	#ifdef FOREGROUND

		vec2 CoCNearFar = texture2D(cocBuffer, vUv).rg;
		float CoC = CoCNearFar.r * scale;

	#else

		float CoC = texture2D(cocBuffer, vUv).g * scale;

	#endif

	if(CoC == 0.0) {

		// Skip blurring.
		gl_FragColor = texture2D(inputBuffer, vUv);

	} else {

		#ifdef FOREGROUND

			// Use far CoC to avoid weak blurring around foreground objects.
			vec2 step = texelSize * max(CoC, CoCNearFar.g * scale);

		#else

			vec2 step = texelSize * CoC;

		#endif

		#if PASS == 1

			vec4 acc = vec4(0.0);

			// kernel64 contains 64 2D sampling points.
			for(int i = 0; i < 128; i += 2) {

				vec2 kernel = vec2(kernel64[i], kernel64[i + 1]);
				vec2 uv = step * kernel + vUv;
				acc += texture2D(inputBuffer, uv);

			}

			gl_FragColor = acc / 64.0;

		#else

			vec4 maxValue = texture2D(inputBuffer, vUv);

			// kernel16 contains 16 2D sampling points.
			for(int i = 0; i < 16; i += 2) {

				vec2 kernel = vec2(kernel16[i], kernel16[i + 1]);
				vec2 uv = step * kernel.xy + vUv;
				maxValue = max(texture2D(inputBuffer, uv), maxValue);

			}

			gl_FragColor = maxValue;

		#endif

	}

}
