uniform sampler2D tDiffuse;
uniform sampler2D tDepth;

uniform vec2 texelSize;
uniform vec2 halfTexelSize;

uniform float zNear;
uniform float zFar;

uniform float focalLength;
uniform float fStop;

uniform float maxBlur;
uniform float luminanceThreshold;
uniform float luminanceGain;
uniform float bias;
uniform float fringe;
uniform float ditherStrength;

#ifdef SHADER_FOCUS

	uniform vec2 focusCoords;

#else

	uniform float focalDepth;

#endif

varying vec2 vUv;

const float TWO_PI = 6.28318531;
const int MAX_RING_SAMPLES = RINGS_INT * SAMPLES_INT;
const float CIRCLE_OF_CONFUSION = 0.03; // 35mm film = 0.03mm CoC.

#ifdef MANUAL_DOF

	const float nDoFStart = 1.0; 
	const float nDoFDist = 2.0;
	const float fDoFStart = 1.0;
	const float fDoFDist = 3.0;

#endif

#ifdef PENTAGON

	const vec4 HS0 = vec4( 1.0,          0.0,         0.0, 1.0);
	const vec4 HS1 = vec4( 0.309016994,  0.951056516, 0.0, 1.0);
	const vec4 HS2 = vec4(-0.809016994,  0.587785252, 0.0, 1.0);
	const vec4 HS3 = vec4(-0.809016994, -0.587785252, 0.0, 1.0);
	const vec4 HS4 = vec4( 0.309016994, -0.951056516, 0.0, 1.0);
	const vec4 HS5 = vec4( 0.0,          0.0,         1.0, 1.0);

	const vec4 ONE = vec4(1.0);

	const float P_FEATHER = 0.4;
	const float N_FEATHER = -P_FEATHER;

	float penta(vec2 coords) {

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

#ifdef SHOW_FOCUS

	vec3 debugFocus(vec3 c, float blur, float depth) {

		float edge = 0.002 * depth;
		float m = clamp(smoothstep(0.0, edge, blur), 0.0, 1.0);
		float e = clamp(smoothstep(1.0 - edge, 1.0, blur), 0.0, 1.0);

		c = mix(c, vec3(1.0, 0.5, 0.0), (1.0 - m) * 0.6);
		c = mix(c, vec3(0.0, 0.5, 1.0), ((1.0 - e) - (1.0 - m)) * 0.2);

		return c;

	}

#endif

#ifdef VIGNETTE

	const vec2 CENTER = vec2(0.5);

	const float VIGNETTE_OUT = 1.3;
	const float VIGNETTE_IN = 0.0;
	const float VIGNETTE_FADE = 22.0; 

	float vignette() {

		float d = distance(vUv, CENTER);
		d = smoothstep(VIGNETTE_OUT + (fStop / VIGNETTE_FADE), VIGNETTE_IN + (fStop / VIGNETTE_FADE), d);

		return clamp(d, 0.0, 1.0);

	}

#endif

vec2 rand(vec2 coord) {

	vec2 noise;

	#ifdef NOISE

		noise.x = clamp(fract(sin(dot(coord, vec2(12.9898, 78.233))) * 43758.5453), 0.0, 1.0) * 2.0 - 1.0;
		noise.y = clamp(fract(sin(dot(coord, vec2(12.9898, 78.233) * 2.0)) * 43758.5453), 0.0, 1.0) * 2.0 - 1.0;

	#else

		noise.x = ((fract(1.0 - coord.s * halfTexelSize.x) * 0.25) + (fract(coord.t * halfTexelSize.y) * 0.75)) * 2.0 - 1.0;
		noise.y = ((fract(1.0 - coord.s * halfTexelSize.x) * 0.75) + (fract(coord.t * halfTexelSize.y) * 0.25)) * 2.0 - 1.0;

	#endif

	return noise;

}

const vec3 LUM_COEFF = vec3(0.299, 0.587, 0.114);

vec3 processTexel(vec2 coords, float blur) {

	vec3 c;
	c.r = texture2D(tDiffuse, coords + vec2(0.0, 1.0) * texelSize * fringe * blur).r;
	c.g = texture2D(tDiffuse, coords + vec2(-0.866, -0.5) * texelSize * fringe * blur).g;
	c.b = texture2D(tDiffuse, coords + vec2(0.866, -0.5) * texelSize * fringe * blur).b;

	// Calculate the luminance of the constructed colour.
	float luminance = dot(c.rgb, LUM_COEFF);
	float threshold = max((luminance - luminanceThreshold) * luminanceGain, 0.0);

	return c + mix(vec3(0.0), c, threshold * blur);

}

float linearize(float depth) {

	return -zFar * zNear / (depth * (zFar - zNear) - zFar);

}

float gather(float i, float j, float ringSamples, inout vec3 color, float w, float h, float blur) {

	float step = TWO_PI / ringSamples;
	float pw = cos(j * step) * i;
	float ph = sin(j * step) * i;

	#ifdef PENTAGON

		float p = penta(vec2(pw, ph));

	#else

		float p = 1.0;

	#endif

	color += processTexel(vUv + vec2(pw * w, ph * h), blur) * mix(1.0, i / RINGS_FLOAT, bias) * p;

	return mix(1.0, i / RINGS_FLOAT, bias) * p;

}

void main() {

	float depth = linearize(texture2D(tDepth, vUv).r);

	#ifdef SHADER_FOCUS

		float fDepth = linearize(texture2D(tDepth, focusCoords).r);

	#else

		float fDepth = focalDepth;

	#endif

	#ifdef MANUAL_DOF

		float focalPlane = depth - fDepth;
		float farDoF = (focalPlane - fDoFStart) / fDoFDist;
		float nearDoF = (-focalPlane - nDoFStart) / nDoFDist;

		float blur = (focalPlane > 0.0) ? farDoF : nearDoF;

	#else

		float focalPlaneMM = fDepth * 1000.0;
		float depthMM = depth * 1000.0;

		float focalPlane = (depthMM * focalLength) / (depthMM - focalLength);
		float farDoF = (focalPlaneMM * focalLength) / (focalPlaneMM - focalLength);
		float nearDoF = (focalPlaneMM - focalLength) / (focalPlaneMM * fStop * CIRCLE_OF_CONFUSION);

		float blur = abs(focalPlane - farDoF) * nearDoF;

	#endif

	blur = clamp(blur, 0.0, 1.0);

	// Dithering.
	vec2 noise = rand(vUv) * ditherStrength * blur;

	float blurFactorX = texelSize.x * blur * maxBlur + noise.x;
	float blurFactorY = texelSize.y * blur * maxBlur + noise.y;

	// Calculation of final color.
	vec4 color;

	if(blur < 0.05) {

		color = texture2D(tDiffuse, vUv);

	} else {

		color = texture2D(tDiffuse, vUv);

		float s = 1.0;
		int ringSamples;

		for(int i = 1; i <= RINGS_INT; ++i) {

			ringSamples = i * SAMPLES_INT;

			// Constant loop.
			for(int j = 0; j < MAX_RING_SAMPLES; ++j) {

				// Break earlier.
				if(j >= ringSamples) { break; }

				s += gather(float(i), float(j), float(ringSamples), color.rgb, blurFactorX, blurFactorY, blur);

			}

		}

		color.rgb /= s; // Divide by sample count.

	}

	#ifdef SHOW_FOCUS

		color.rgb = debugFocus(color.rgb, blur, depth);

	#endif

	#ifdef VIGNETTE

		color.rgb *= vignette();

	#endif

	gl_FragColor = color;

}
