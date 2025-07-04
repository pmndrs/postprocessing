#ifdef TEXTURE_PRECISION_HIGH

	uniform mediump sampler2D map;

#else

	uniform lowp sampler2D map;

#endif

varying vec2 vUv2;

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {

	#ifdef UV_TRANSFORM

		vec4 texel = texture2D(map, vUv2);

	#else

		vec4 texel = texture2D(map, uv);

	#endif

	outputColor = TEXEL;
	outputColor.a = max(inputColor.a, outputColor.a);

}
