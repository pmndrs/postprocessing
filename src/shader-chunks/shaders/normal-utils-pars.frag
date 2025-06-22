/**
 * Reads a normal vector from a given buffer. Supports octahedron encoding and decoding.
 *
 * @param normalBuffer - The normal texture.
 * @param uv - The texture coordinates.
 * @return The normal.
 */

vec3 readNormal(mediump sampler2D normalBuffer, const in vec2 uv) {

	#ifdef PP_NORMAL_VELOCITY

		return pp_decodeNormal(texture(normalBuffer, uv).xy);

	#else

		return texture(normalBuffer, uv).xyz;

	#endif

}
