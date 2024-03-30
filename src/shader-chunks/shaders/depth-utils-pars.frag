// Define macro functions for calculating viewZ depending on the camera type.
#ifdef PERSPECTIVE_CAMERA

	#define getViewZ(depth, near, far) perspectiveDepthToViewZ(depth, near, far)

#else

	#define getViewZ(depth, near, far) orthographicDepthToViewZ(depth, near, far)

#endif

/**
 * Reads a depth value from a given buffer. Supports logarithmic depth.
 *
 * @param depthBuffer - The depth texture.
 * @param uv - The texture coordinates.
 * @param near - The camera near plane value.
 * @param far - The camera far plane value.
 * @return The linear depth value.
 */

float readDepth(sampler2D depthBuffer, const in vec2 uv, const in float near, const in float far) {

	float depth = texture(depthBuffer, uv).r;

	#ifdef LOG_DEPTH

		float d = pow(2.0, depth * log2(far + 1.0)) - 1.0;
		float a = far / (far - near);
		float b = far * near / (near - far);
		depth = a + b / d;

	#endif

	return depth;

}

/**
 * Calculates a view position based on a given screen position, depth and viewZ.
 *
 * @param screenPosition - The screen position.
 * @param depth - The depth value.
 * @param viewZ - The viewZ value.
 * @param projectionMatrix - The projection matrix.
 * @param projectionMatrixInverse - The inverse projection matrix.
 * @return The view position.
 */

vec3 getViewPosition(const in vec2 screenPosition, const in float depth, const in float viewZ,
	const in mat4 projectionMatrix, const in mat4 projectionMatrixInverse) {

	vec4 clipPosition = vec4(vec3(screenPosition, depth) * 2.0 - 1.0, 1.0);

	// Unoptimized version:
	// vec4 viewPosition = projectionMatrixInverse * clipPosition;
	// viewPosition /= viewPosition.w; // Unproject.
	// return viewPosition.xyz;

	float clipW = projectionMatrix[2][3] * viewZ + projectionMatrix[3][3];
	clipPosition *= clipW; // Unproject.

	return (projectionMatrixInverse * clipPosition).xyz;

}

/**
 * Calculates the model view position based on a given view position and view matrix.
 *
 * @param viewPosition - The view position.
 * @param viewMatrix - The inverse camera transformation matrix.
 * @return The model view position.
 */

vec3 getModelViewPosition(const in vec3 viewPosition, const in mat4 viewMatrix) {

	vec4 mvPosition = viewMatrix * vec4(viewPosition, 1.0);
	return -mvPosition.xyz;

}
