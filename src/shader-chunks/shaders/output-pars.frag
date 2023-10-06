layout(location = 0) out OUTPUT_COLOR_PRECISION vec4 outputColor;

#ifdef GBUFFER_NORMAL

	layout(location = 1) out mediump vec4 outputNormal;

#endif

// Added for compatibility with built-in shader chunks that modify gl_FragColor.
#define gl_FragColor outputColor

#if OUTPUT_COLORSPACE == 1

	#define linearToOutputTexel(texel) sRGBTransferOETF(texel)

#else

	#define linearToOutputTexel(texel) texel

#endif
