#ifndef gl_FragColor

	layout(location = 0) out OUTPUT_COLOR_PRECISION vec4 outputColor;

	// Added for compatibility with built-in shader chunks.
	#define gl_FragColor outputColor

#endif
