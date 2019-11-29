uniform sampler2D normalBuffer;

uniform mat4 cameraProjectionMatrix;
uniform mat4 cameraInverseProjectionMatrix;

uniform vec2 radiusStep;
uniform vec2 distanceCutoff;
uniform vec2 proximityCutoff;
uniform float seed;
uniform float luminanceInfluence;
uniform float scale;
uniform float bias;

vec3 getViewPosition(const in vec2 screenPosition, const in float depth, const in float viewZ) {

	float clipW = cameraProjectionMatrix[2][3] * viewZ + cameraProjectionMatrix[3][3];
	vec4 clipPosition = vec4((vec3(screenPosition, depth) - 0.5) * 2.0, 1.0);
	clipPosition *= clipW; // Unproject.

	return (cameraInverseProjectionMatrix * clipPosition).xyz;

}

float getOcclusion(const in vec3 p, const in vec3 n, const in vec3 sampleViewPosition) {

	vec3 viewDelta = sampleViewPosition - p;
	float d = length(viewDelta) * scale;

	return max(0.0, dot(n, viewDelta) / d - bias) / (1.0 + pow2(d));

}

float getAmbientOcclusion(const in vec3 p, const in vec3 n, const in float depth, const in vec2 uv) {

	vec2 radius = radiusStep;
	float angle = rand(uv + seed) * PI2;
	float occlusionSum = 0.0;

	for(int i = 0; i < SAMPLES_INT; ++i) {

		vec2 coord = uv + vec2(cos(angle), sin(angle)) * radius;
		radius += radiusStep;
		angle += ANGLE_STEP;

		float sampleDepth = readDepth(coord);
		float viewZ = getViewZ(sampleDepth);

		#ifdef PERSPECTIVE_CAMERA

			float linearSampleDepth = viewZToOrthographicDepth(viewZ, cameraNear, cameraFar);

		#else

			float linearSampleDepth = sampleDepth;

		#endif

		float proximity = abs(depth - linearSampleDepth);

		if(linearSampleDepth < distanceCutoff.y && proximity < proximityCutoff.y) {

			float falloff = 1.0 - smoothstep(proximityCutoff.x, proximityCutoff.y, proximity);
			vec3 sampleViewPosition = getViewPosition(coord, sampleDepth, viewZ);
			occlusionSum += getOcclusion(p, n, sampleViewPosition) * falloff;

		}

	}

	return occlusionSum / SAMPLES_FLOAT;

}

void mainImage(const in vec4 inputColor, const in vec2 uv, const in float depth, out vec4 outputColor) {

	float ao = 1.0;
	float viewZ = getViewZ(depth);

	#ifdef PERSPECTIVE_CAMERA

		float linearDepth = viewZToOrthographicDepth(viewZ, cameraNear, cameraFar);

	#else

		float linearDepth = depth;

	#endif

	// Skip fragments of objects that are too far away.
	if(linearDepth < distanceCutoff.y) {

		vec3 viewPosition = getViewPosition(uv, depth, viewZ);
		vec3 viewNormal = unpackRGBToNormal(texture2D(normalBuffer, uv).xyz);
		ao -= getAmbientOcclusion(viewPosition, viewNormal, linearDepth, uv);

		// Fade AO based on luminance and depth.
		float l = linearToRelativeLuminance(inputColor.rgb);
		float d = smoothstep(distanceCutoff.x, distanceCutoff.y, linearDepth);
		float f = max(l * luminanceInfluence, d);
		ao = mix(ao, 1.0, f);

	}

	outputColor = vec4(vec3(ao), inputColor.a);

}
