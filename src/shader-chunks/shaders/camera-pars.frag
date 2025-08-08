uniform mat4 projectionMatrix;
uniform mat4 projectionMatrixInverse;
uniform vec3 cameraParams;

#define CAMERA_NEAR cameraParams.x
#define CAMERA_FAR cameraParams.y
#define CAMERA_ASPECT cameraParams.z

// Define macro functions for calculating viewZ depending on the camera type.
#ifdef PERSPECTIVE_CAMERA

	#define getViewZ(depth) perspectiveDepthToViewZ(depth, CAMERA_NEAR, CAMERA_FAR)

#else

	#define getViewZ(depth) orthographicDepthToViewZ(depth, CAMERA_NEAR, CAMERA_FAR)

#endif

/**
 * Calculates a view position based on a given screen position, depth and viewZ.
 *
 * @param screenPosition - The screen position.
 * @param depth - The depth value.
 * @param viewZ - The viewZ value.
 * @return The view position.
 */

vec3 getViewPosition(const in vec2 screenPosition, const in float depth, const in float viewZ) {

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
 * Calculates a view position based on a given screen position and depth.
 *
 * @param screenPosition - The screen position.
 * @param depth - The depth value.
 * @return The view position.
 */

vec3 getViewPosition(const in vec2 screenPosition, const in float depth) {

	return getViewPosition(screenPosition, depth, getViewZ(depth));

}
