// Location 0 is already defined in built-in materials.
#ifndef gl_FragColor

	#ifdef GBUFFER_COLOR

		layout(location = GBUFFER_COLOR) out OUTPUT_COLOR_PRECISION vec4 outputColor;

		// Added for compatibility with built-in shader chunks.
		#define gl_FragColor outputColor

	#endif

#endif

#ifndef RENDER_TO_SCREEN

	#ifdef GBUFFER_NORMAL

		layout(location = GBUFFER_NORMAL) out mediump vec4 outputNormal;

	#endif

	#if defined(GBUFFER_ROUGHNESS) || defined(GBUFFER_METALNESS)
dd
		// Both components use the same location.
		layout(location = GBUFFER_METALNESS) out lowp vec2 outputRoughMetal;

	#endif

#endif
