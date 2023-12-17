#if OUTPUT_COLOR_SPACE == 1

	#define linearToOutputTexel(texel) sRGBTransferOETF(texel)

#else

	#define linearToOutputTexel(texel) texel

#endif
