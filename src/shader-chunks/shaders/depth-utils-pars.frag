/**
 * Reads a depth value from a given buffer. Supports logarithmic depth.
 *
 * @param depthBuffer - The depth texture.
 * @param uv - The texture coordinates.
 * @param near - The camera near plane value.
 * @param far - The camera far plane value.
 * @return The depth.
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
