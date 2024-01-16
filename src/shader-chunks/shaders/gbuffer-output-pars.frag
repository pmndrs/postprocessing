// Location 0 is already defined in built-in materials.
#ifndef gl_FragColor

	#ifndef LOCATION_OUTPUTCOLOR

		#define LOCATION_OUTPUTCOLOR 0

	#endif

	layout(location = LOCATION_OUTPUTCOLOR) out OUTPUT_COLOR_PRECISION vec4 outputColor;
	#define gl_FragColor outputColor
	#define HAS_OUTPUTCOLOR

#endif

// Other outputs are only available when rendering to texture.
#ifndef RENDER_TO_SCREEN

	#ifdef LOCATION_OUTPUTNORMAL

		layout(location = LOCATION_OUTPUTNORMAL) out mediump vec4 outputNormal;
		#define HAS_OUTPUTNORMAL

	#endif

	#ifdef LOCATION_OUTPUTROUGHNESSMETALNESS

		layout(location = LOCATION_OUTPUTROUGHNESSMETALNESS) out lowp vec2 outputRoughnessMetalness;
		#define HAS_OUTPUTROUGHNESSMETALNESS

	#endif

#endif
