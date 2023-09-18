#ifdef FRAMEBUFFER_PRECISION_HIGH

	uniform mediump sampler2D inputBuffer;

#else

	uniform lowp sampler2D inputBuffer;

#endif

#if PASS == 1

	uniform vec4 kernel64[32];

#else

	uniform vec4 kernel16[8];

#endif

uniform lowp sampler2D cocBuffer;
uniform vec2 texelSize;
uniform float scale;

varying vec2 vUv;

void main() {

	#ifdef FOREGROUND

		vec2 cocNearFar = texture2D(cocBuffer, vUv).rg * scale;
		float coc = cocNearFar.x;

	#else

		float coc = texture2D(cocBuffer, vUv).g * scale;

	#endif

	if(coc == 0.0) {

		// Skip blurring.
		gl_FragColor = texture2D(inputBuffer, vUv);

	} else {

		#ifdef FOREGROUND

			// Use far CoC to avoid weak blurring around foreground objects.
			vec2 step = texelSize * max(cocNearFar.x, cocNearFar.y);

		#else

			vec2 step = texelSize * coc;

		#endif

		#if PASS == 1

			vec4 acc = vec4(0.0);

			// Each vector contains two sampling points (64 in total).
			for(int i = 0; i < 32; ++i) {

				vec4 kernel = kernel64[i];

				vec2 uv = step * kernel.xy + vUv;
				acc += texture2D(inputBuffer, uv);

				uv = step * kernel.zw + vUv;
				acc += texture2D(inputBuffer, uv);

			}

			gl_FragColor = acc / 64.0;

		#else

			vec4 maxValue = texture2D(inputBuffer, vUv);

			// Each vector contains two sampling points (16 in total).
			for(int i = 0; i < 8; ++i) {

				vec4 kernel = kernel16[i];

				vec2 uv = step * kernel.xy + vUv;
				maxValue = max(texture2D(inputBuffer, uv), maxValue);

				uv = step * kernel.zw + vUv;
				maxValue = max(texture2D(inputBuffer, uv), maxValue);


			}

			gl_FragColor = maxValue;

		#endif

	}

}
