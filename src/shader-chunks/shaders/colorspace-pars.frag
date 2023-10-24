#if OUTPUT_COLORSPACE == 1

	#define linearToOutputTexel(texel) sRGBTransferOETF(texel)

#else

	#define linearToOutputTexel(texel) texel

#endif
