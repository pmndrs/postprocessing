uniform sampler2D inputBuffer;
uniform sampler2D cocBuffer;

uniform vec2 texelSize;
uniform float scale;

#if PASS == 1

	uniform float kernel64[128];

#else

	uniform float kernel16[32];

#endif

varying vec2 vUv;

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

			for(int i = 0; i < 128; i += 2) {

				vec2 uv = step * vec2(kernel64[i], kernel64[i + 1]) + vUv;
				acc += texture2D(inputBuffer, uv);

			}

			gl_FragColor = acc / 64.0;

		#else

			vec4 maxValue = texture2D(inputBuffer, vUv);

			for(int i = 0; i < 32; i += 2) {

				vec2 uv = step * vec2(kernel16[i], kernel16[i + 1]) + vUv;
				maxValue = max(texture2D(inputBuffer, uv), maxValue);

			}

			gl_FragColor = maxValue;

		#endif

	}

}
