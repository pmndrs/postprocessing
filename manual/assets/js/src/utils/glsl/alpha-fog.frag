#ifdef USE_FOG

	float range = length(vWorldPosition - cameraPosition);

	#ifdef FOG_EXP2

		float fogFactor = 1.0 - exp(-fogDensity * fogDensity * range * range);

	#else

		float fogFactor = smoothstep(fogNear, fogFar, range);

	#endif

	gl_FragColor.a = saturate(1.0 - fogFactor);

#endif
