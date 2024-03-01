#ifdef TEXTURE_PRECISION_HIGH

	uniform mediump sampler2D map;

#else

	uniform lowp sampler2D map;

#endif

#ifdef UV_TRANSFORM

	in vec2 vUv2;

#endif

vec4 mainImage(const in vec4 inputColor, const in vec2 uv, const in GData gData) {

	#ifdef UV_TRANSFORM

		vec4 texel = texture(map, vUv2);

	#else

		vec4 texel = texture(map, uv);

	#endif

	return TEXEL;

}
