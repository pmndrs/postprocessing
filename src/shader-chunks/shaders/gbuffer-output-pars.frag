// Location 0 is already defined in built-in materials.
#ifndef gl_FragColor

	#ifndef GBUFFER_COLOR

		// Fall back to index 0 if no GBuffer indices have been defined.
		#define GBUFFER_COLOR 0

	#endif

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

	// Roughness and metalness use the same location.
	#if defined(GBUFFER_ROUGHNESS)

		layout(location = GBUFFER_ROUGHNESS) out lowp vec2 outputRoughMetal;

	#elif defined(GBUFFER_METALNESS)

		layout(location = GBUFFER_METALNESS) out lowp vec2 outputRoughMetal;

	#endif

#endif
