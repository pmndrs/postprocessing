uniform float focus;
uniform float focalLength;
uniform float fStop;
uniform float maxBlur;
uniform float luminanceThreshold;
uniform float luminanceGain;
uniform float bias;
uniform float fringe;

#ifdef MANUAL_DOF

	uniform vec4 dof;

#endif

#ifdef PENTAGON

	float pentagon(const in vec2 coords) {

		const vec4 HS0 = vec4( 1.0,          0.0,         0.0, 1.0);
		const vec4 HS1 = vec4( 0.309016994,  0.951056516, 0.0, 1.0);
		const vec4 HS2 = vec4(-0.809016994,  0.587785252, 0.0, 1.0);
		const vec4 HS3 = vec4(-0.809016994, -0.587785252, 0.0, 1.0);
		const vec4 HS4 = vec4( 0.309016994, -0.951056516, 0.0, 1.0);
		const vec4 HS5 = vec4( 0.0,          0.0,         1.0, 1.0);

		const vec4 ONE = vec4(1.0);

		const float P_FEATHER = 0.4;
		const float N_FEATHER = -P_FEATHER;

		float inOrOut = -4.0;

		vec4 P = vec4(coords, vec2(RINGS_FLOAT - 1.3));

		vec4 dist = vec4(
			dot(P, HS0),
			dot(P, HS1),
			dot(P, HS2),
			dot(P, HS3)
		);

		dist = smoothstep(N_FEATHER, P_FEATHER, dist);

		inOrOut += dot(dist, ONE);

		dist.x = dot(P, HS4);
		dist.y = HS5.w - abs(P.z);

		dist = smoothstep(N_FEATHER, P_FEATHER, dist);
		inOrOut += dist.x;

		return clamp(inOrOut, 0.0, 1.0);

	}

#endif

vec3 processTexel(const in vec2 coords, const in float blur) {

	vec2 scale = texelSize * fringe * blur;

	vec3 c = vec3(
		texture2D(inputBuffer, coords + vec2(0.0, 1.0) * scale).r,
		texture2D(inputBuffer, coords + vec2(-0.866, -0.5) * scale).g,
		texture2D(inputBuffer, coords + vec2(0.866, -0.5) * scale).b
	);

	// Calculate the luminance of the constructed color.
	float luminance = linearToRelativeLuminance(c);
	float threshold = max((luminance - luminanceThreshold) * luminanceGain, 0.0);

	return c + mix(vec3(0.0), c, threshold * blur);

}

float gather(const in float i, const in float j, const in float ringSamples,
	const in vec2 uv, const in vec2 blurFactor, const in float blur, inout vec3 color) {

	float step = PI2 / ringSamples;
	vec2 wh = vec2(cos(j * step) * i, sin(j * step) * i);

	#ifdef PENTAGON

		float p = pentagon(wh);

	#else

		float p = 1.0;

	#endif

	color += processTexel(wh * blurFactor + uv, blur) * mix(1.0, i / RINGS_FLOAT, bias) * p;

	return mix(1.0, i / RINGS_FLOAT, bias) * p;

}

void mainImage(const in vec4 inputColor, const in vec2 uv, const in float depth, out vec4 outputColor) {

	#ifdef PERSPECTIVE_CAMERA

		float viewZ = perspectiveDepthToViewZ(depth, cameraNear, cameraFar);
		float linearDepth = viewZToOrthographicDepth(viewZ, cameraNear, cameraFar);

	#else

		float linearDepth = depth;

	#endif

	#ifdef MANUAL_DOF

		float focalPlane = linearDepth - focus;
		float farDoF = (focalPlane - dof.z) / dof.w;
		float nearDoF = (-focalPlane - dof.x) / dof.y;

		float blur = (focalPlane > 0.0) ? farDoF : nearDoF;

	#else

		const float CIRCLE_OF_CONFUSION = 0.03; // 35mm film = 0.03mm CoC.

		float focalPlaneMM = focus * 1000.0;
		float depthMM = linearDepth * 1000.0;

		float focalPlane = (depthMM * focalLength) / (depthMM - focalLength);
		float farDoF = (focalPlaneMM * focalLength) / (focalPlaneMM - focalLength);
		float nearDoF = (focalPlaneMM - focalLength) / (focalPlaneMM * fStop * CIRCLE_OF_CONFUSION);

		float blur = abs(focalPlane - farDoF) * nearDoF;

	#endif

	const int MAX_RING_SAMPLES = RINGS_INT * SAMPLES_INT;

	blur = clamp(blur, 0.0, 1.0);
	vec3 color = inputColor.rgb;

	if(blur >= 0.05) {

		vec2 blurFactor = blur * maxBlur * texelSize;

		float s = 1.0;
		int ringSamples;

		for(int i = 1; i <= RINGS_INT; i++) {

			ringSamples = i * SAMPLES_INT;

			for(int j = 0; j < MAX_RING_SAMPLES; j++) {

				if(j >= ringSamples) {

					break;

				}

				s += gather(float(i), float(j), float(ringSamples), uv, blurFactor, blur, color);

			}

		}

		color /= s;

	}

	#ifdef SHOW_FOCUS

		float edge = 0.002 * linearDepth;
		float m = clamp(smoothstep(0.0, edge, blur), 0.0, 1.0);
		float e = clamp(smoothstep(1.0 - edge, 1.0, blur), 0.0, 1.0);

		color = mix(color, vec3(1.0, 0.5, 0.0), (1.0 - m) * 0.6);
		color = mix(color, vec3(0.0, 0.5, 1.0), ((1.0 - e) - (1.0 - m)) * 0.2);

	#endif

	outputColor = vec4(color, inputColor.a);

}
