#ifdef USE_FOG

	#ifdef FOG_EXP2

		float fogFactor = 1.0 - exp(-fogDensity * fogDensity * vFogDepth * vFogDepth);

	#else

		float fogFactor = smoothstep(fogNear, fogFar, vFogDepth);

	#endif

	gl_FragColor.a = saturate(1.0 - fogFactor);

#endif
