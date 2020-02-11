uniform sampler2D inputBuffer;
uniform sampler2D cocBuffer;

uniform vec2 cocMask;
uniform vec2 texelSize;
uniform float scale;

#if PASS == 1

	uniform float kernel64[128];

#else

	uniform float kernel16[32];

#endif

varying vec2 vUv;

void main() {

	vec2 CoCNearFar = min(texture2D(cocBuffer, vUv).rg, cocMask);
	float CoC = CoCNearFar.r + CoCNearFar.g;
	vec2 step = texelSize * scale * CoC;

	#if PASS == 1

		vec4 acc = vec4(0.0);

		for(int i = 0; i < 128; i += 2) {

			vec2 uv = step * vec2(kernel64[i], kernel64[i + 1]) + vUv;
			vec4 texel = texture2D(inputBuffer, uv);
			acc += texel;

		}

		gl_FragColor = acc / 64.0;

	#else

		vec4 maxValue = texture2D(inputBuffer, vUv);

		for(int i = 0; i < 32; i += 2) {

			vec2 uv = step * vec2(kernel16[i], kernel16[i + 1]) + vUv;
			vec4 texel = texture2D(inputBuffer, uv);
			maxValue = max(texel, maxValue);

		}

		gl_FragColor = maxValue;

	#endif

}
