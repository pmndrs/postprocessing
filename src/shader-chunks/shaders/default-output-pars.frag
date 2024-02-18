#ifndef gl_FragColor

	layout(location = 0) out OUTPUT_COLOR_PRECISION vec4 out_FragData0;

	// Added for compatibility with built-in shader chunks.
	#define gl_FragColor out_FragData0

	#ifndef out_Color

		#define out_Color out_FragData0

	#endif

#endif
