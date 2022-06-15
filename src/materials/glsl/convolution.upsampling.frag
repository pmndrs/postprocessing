#ifdef FRAMEBUFFER_PRECISION_HIGH

	uniform mediump sampler2D inputBuffer;
	uniform mediump sampler2D supportBuffer;

#else

	uniform lowp sampler2D inputBuffer;
	uniform lowp sampler2D supportBuffer;

#endif

uniform float radius;

uniform vec2 texelSize;
uniform vec3 kernel[SAMPLES];

varying vec2 vUv;

vec4 textureClampToBorder(sampler2D map, const in vec2 uv) {

	return (uv.s < 0.0 || uv.s > 1.0 || uv.t < 0.0 || uv.t > 1.0) ? vec4(0.0) : texture2D(map, uv);

}

void main() {

	vec4 c = vec4(0.0);

	for(int i = 0; i < SAMPLES; ++i) {

		vec2 uv = vUv + kernel[i].xy * texelSize;
		c += kernel[i].z * textureClampToBorder(inputBuffer, uv);

	}

	vec4 baseColor = texture2D(supportBuffer, vUv);
	gl_FragColor = mix(baseColor, c, radius);

	#include <encodings_fragment>

}
