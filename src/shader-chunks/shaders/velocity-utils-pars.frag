/**
 * Reads a velocity vector from a given buffer.
 *
 * @param normalBuffer - The velocity texture.
 * @param uv - The texture coordinates.
 * @return The velocity.
 */

vec2 readVelocity(mediump sampler2D velocityBuffer, const in vec2 uv) {

	#ifdef PP_NORMAL_VELOCITY

		return texture(velocityBuffer, uv).zw;

	#else

		return texture(velocityBuffer, uv).xy;

	#endif

}
