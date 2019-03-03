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

float getViewZ(const in float depth) {

	#ifdef PERSPECTIVE_CAMERA

		return perspectiveDepthToViewZ(depth, cameraNear, cameraFar);

	#else

		return orthographicDepthToViewZ(depth, cameraNear, cameraFar);

	#endif

}

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
		float proximity = abs(depth - sampleDepth);

		if(sampleDepth < distanceCutoff.y && proximity < proximityCutoff.y) {

			float falloff = 1.0 - smoothstep(proximityCutoff.x, proximityCutoff.y, proximity);
			vec3 sampleViewPosition = getViewPosition(coord, sampleDepth, getViewZ(sampleDepth));
			occlusionSum += getOcclusion(p, n, sampleViewPosition) * falloff;

		}

	}

	return occlusionSum / SAMPLES_FLOAT;

}

void mainImage(const in vec4 inputColor, const in vec2 uv, const in float depth, out vec4 outputColor) {

	float ao = 1.0;

	// Skip fragments of objects that are too far away.
	if(depth < distanceCutoff.y) {

		vec3 viewPosition = getViewPosition(uv, depth, getViewZ(depth));
		vec3 viewNormal = unpackRGBToNormal(texture2D(normalBuffer, uv).xyz);
		ao -= getAmbientOcclusion(viewPosition, viewNormal, depth, uv);

		// Fade AO based on luminance and depth.
		float l = linearToRelativeLuminance(inputColor.rgb);
		ao = mix(ao, 1.0, max(l * luminanceInfluence, smoothstep(distanceCutoff.x, distanceCutoff.y, depth)));

	}

	outputColor = vec4(vec3(ao), inputColor.a);

}
