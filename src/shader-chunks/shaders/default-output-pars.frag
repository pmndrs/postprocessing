#ifndef gl_FragColor

	#ifndef OUTPUT_COLOR_PRECISION

		// Don't specify the precision if this macro is not set.
		#define OUTPUT_COLOR_PRECISION

	#endif

	layout(location = 0) out OUTPUT_COLOR_PRECISION vec4 out_FragData0;

	// Added for compatibility with built-in shader chunks.
	#define gl_FragColor out_FragData0

	#ifndef out_Color

		#define out_Color out_FragData0

	#endif

#endif
