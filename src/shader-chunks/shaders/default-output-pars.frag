#ifndef gl_FragColor

	layout(location = 0) out OUTPUT_COLOR_PRECISION vec4 pc_FragData0;

	// Added for compatibility with built-in shader chunks.
	#define gl_FragColor pc_FragData0

	#ifndef outputColor

		#define outputColor pc_FragData0

	#endif

#endif
