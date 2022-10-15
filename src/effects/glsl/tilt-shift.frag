#ifdef FRAMEBUFFER_PRECISION_HIGH

	uniform mediump sampler2D map;

#else

	uniform lowp sampler2D map;

#endif

uniform vec4 maskParams;
varying vec2 vUv2;

float linearGradientMask(const in float x) {

	return smoothstep(maskParams.x, maskParams.y, x) -
		smoothstep(maskParams.w, maskParams.z, x);

}

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {

	float mask = linearGradientMask(vUv2.y);
	vec4 texel = texture2D(map, uv);
	outputColor = mix(texel, inputColor, mask);

}
