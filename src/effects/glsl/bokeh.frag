uniform float focus;
uniform float dof;
uniform float aperture;
uniform float maxBlur;

void mainImage(const in vec4 inputColor, const in vec2 uv, const in float depth, out vec4 outputColor) {

	vec2 aspectCorrection = vec2(1.0, aspect);

	#ifdef PERSPECTIVE_CAMERA

		float viewZ = perspectiveDepthToViewZ(depth, cameraNear, cameraFar);
		float linearDepth = viewZToOrthographicDepth(viewZ, cameraNear, cameraFar);

	#else

		float linearDepth = depth;

	#endif

	float focusNear = clamp(focus - dof, 0.0, 1.0);
	float focusFar = clamp(focus + dof, 0.0, 1.0);

	// Calculate a DoF mask.
	float low = step(linearDepth, focusNear);
	float high = step(focusFar, linearDepth);

	float factor = (linearDepth - focusNear) * low + (linearDepth - focusFar) * high;
	vec2 dofBlur = vec2(clamp(factor * aperture, -maxBlur, maxBlur));

	vec2 dofblur9 = dofBlur * 0.9;
	vec2 dofblur7 = dofBlur * 0.7;
	vec2 dofblur4 = dofBlur * 0.4;

	vec4 color = inputColor;
	color += texture2D(inputBuffer, uv + (vec2( 0.0,   0.4 ) * aspectCorrection) * dofBlur);
	color += texture2D(inputBuffer, uv + (vec2( 0.15,  0.37) * aspectCorrection) * dofBlur);
	color += texture2D(inputBuffer, uv + (vec2( 0.29,  0.29) * aspectCorrection) * dofBlur);
	color += texture2D(inputBuffer, uv + (vec2(-0.37,  0.15) * aspectCorrection) * dofBlur);
	color += texture2D(inputBuffer, uv + (vec2( 0.40,  0.0 ) * aspectCorrection) * dofBlur);
	color += texture2D(inputBuffer, uv + (vec2( 0.37, -0.15) * aspectCorrection) * dofBlur);
	color += texture2D(inputBuffer, uv + (vec2( 0.29, -0.29) * aspectCorrection) * dofBlur);
	color += texture2D(inputBuffer, uv + (vec2(-0.15, -0.37) * aspectCorrection) * dofBlur);
	color += texture2D(inputBuffer, uv + (vec2( 0.0,  -0.4 ) * aspectCorrection) * dofBlur);
	color += texture2D(inputBuffer, uv + (vec2(-0.15,  0.37) * aspectCorrection) * dofBlur);
	color += texture2D(inputBuffer, uv + (vec2(-0.29,  0.29) * aspectCorrection) * dofBlur);
	color += texture2D(inputBuffer, uv + (vec2( 0.37,  0.15) * aspectCorrection) * dofBlur);
	color += texture2D(inputBuffer, uv + (vec2(-0.4,   0.0 ) * aspectCorrection) * dofBlur);
	color += texture2D(inputBuffer, uv + (vec2(-0.37, -0.15) * aspectCorrection) * dofBlur);
	color += texture2D(inputBuffer, uv + (vec2(-0.29, -0.29) * aspectCorrection) * dofBlur);
	color += texture2D(inputBuffer, uv + (vec2( 0.15, -0.37) * aspectCorrection) * dofBlur);

	color += texture2D(inputBuffer, uv + (vec2( 0.15,  0.37) * aspectCorrection) * dofblur9);
	color += texture2D(inputBuffer, uv + (vec2(-0.37,  0.15) * aspectCorrection) * dofblur9);
	color += texture2D(inputBuffer, uv + (vec2( 0.37, -0.15) * aspectCorrection) * dofblur9);
	color += texture2D(inputBuffer, uv + (vec2(-0.15, -0.37) * aspectCorrection) * dofblur9);
	color += texture2D(inputBuffer, uv + (vec2(-0.15,  0.37) * aspectCorrection) * dofblur9);
	color += texture2D(inputBuffer, uv + (vec2( 0.37,  0.15) * aspectCorrection) * dofblur9);
	color += texture2D(inputBuffer, uv + (vec2(-0.37, -0.15) * aspectCorrection) * dofblur9);
	color += texture2D(inputBuffer, uv + (vec2( 0.15, -0.37) * aspectCorrection) * dofblur9);

	color += texture2D(inputBuffer, uv + (vec2( 0.29,  0.29) * aspectCorrection) * dofblur7);
	color += texture2D(inputBuffer, uv + (vec2( 0.40,  0.0 ) * aspectCorrection) * dofblur7);
	color += texture2D(inputBuffer, uv + (vec2( 0.29, -0.29) * aspectCorrection) * dofblur7);
	color += texture2D(inputBuffer, uv + (vec2( 0.0,  -0.4 ) * aspectCorrection) * dofblur7);
	color += texture2D(inputBuffer, uv + (vec2(-0.29,  0.29) * aspectCorrection) * dofblur7);
	color += texture2D(inputBuffer, uv + (vec2(-0.4,   0.0 ) * aspectCorrection) * dofblur7);
	color += texture2D(inputBuffer, uv + (vec2(-0.29, -0.29) * aspectCorrection) * dofblur7);
	color += texture2D(inputBuffer, uv + (vec2( 0.0,   0.4 ) * aspectCorrection) * dofblur7);

	color += texture2D(inputBuffer, uv + (vec2( 0.29,  0.29) * aspectCorrection) * dofblur4);
	color += texture2D(inputBuffer, uv + (vec2( 0.4,   0.0 ) * aspectCorrection) * dofblur4);
	color += texture2D(inputBuffer, uv + (vec2( 0.29, -0.29) * aspectCorrection) * dofblur4);
	color += texture2D(inputBuffer, uv + (vec2( 0.0,  -0.4 ) * aspectCorrection) * dofblur4);
	color += texture2D(inputBuffer, uv + (vec2(-0.29,  0.29) * aspectCorrection) * dofblur4);
	color += texture2D(inputBuffer, uv + (vec2(-0.4,   0.0 ) * aspectCorrection) * dofblur4);
	color += texture2D(inputBuffer, uv + (vec2(-0.29, -0.29) * aspectCorrection) * dofblur4);
	color += texture2D(inputBuffer, uv + (vec2( 0.0,   0.4 ) * aspectCorrection) * dofblur4);

	outputColor = color / 41.0;

}
