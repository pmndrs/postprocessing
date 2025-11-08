#include <common>
#include <packing>

#ifdef GL_FRAGMENT_PRECISION_HIGH

	uniform highp sampler2D depthBuffer;

#else

	uniform mediump sampler2D depthBuffer;

#endif

uniform mat4 projectionMatrix;
uniform mat4 projectionMatrixInverse;
uniform float cameraNear;
uniform float cameraFar;

uniform float focusDistance;
uniform float focusRange;

varying vec2 vUv;

float readDepth(const in vec2 uv) {

	#if DEPTH_PACKING == 3201

		float depth = unpackRGBAToDepth(texture2D(depthBuffer, uv));

	#else

		float depth = texture2D(depthBuffer, uv).r;

	#endif

	#if defined(USE_LOGARITHMIC_DEPTH_BUFFER) || defined(LOG_DEPTH)

		float d = pow(2.0, depth * log2(cameraFar + 1.0)) - 1.0;
		float a = cameraFar / (cameraFar - cameraNear);
		float b = cameraFar * cameraNear / (cameraNear - cameraFar);
		depth = a + b / d;

	#elif defined(USE_REVERSED_DEPTH_BUFFER)

		depth = 1.0 - depth;

	#endif

	return depth;

}

#ifdef PERSPECTIVE_CAMERA

	#define getViewZ(depth) perspectiveDepthToViewZ(depth, cameraNear, cameraFar)

#else

	#define getViewZ(depth) orthographicDepthToViewZ(depth, cameraNear, cameraFar)

#endif

vec3 getViewPosition(const in vec2 screenPosition, const in float depth, const in float viewZ) {

	vec4 clipPosition = vec4(vec3(screenPosition, depth) * 2.0 - 1.0, 1.0);
	float clipW = projectionMatrix[2][3] * viewZ + projectionMatrix[3][3];
	clipPosition *= clipW; // Unproject.

	return (projectionMatrixInverse * clipPosition).xyz;

}

vec3 getViewPosition(const in vec2 screenPosition, const in float depth) {

	return getViewPosition(screenPosition, depth, getViewZ(depth));

}

#define getDistance(viewPosition) length(viewPosition)

void main() {

	float depth = readDepth(vUv);
	vec3 viewPosition = getViewPosition(vUv, depth);
	float distance = getDistance(viewPosition);

	float signedDistance = distance - focusDistance;
	float magnitude = smoothstep(0.0, focusRange, abs(signedDistance));

	gl_FragColor.rg = magnitude * vec2(
		step(signedDistance, 0.0),
		step(0.0, signedDistance)
	);

}
