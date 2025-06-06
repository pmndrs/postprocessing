/**
 * Reads a normal vector from a given buffer. Supports octahedron encoding and decoding.
 *
 * @param normalBuffer - The normal texture.
 * @param uv - The texture coordinates.
 * @return The normal.
 */

vec3 readNormal(mediump sampler2D normalBuffer, const in vec2 uv) {

	#ifdef OCT_WRAP_NORMAL

		return pp_decodeNormal(texture(normalBuffer, uv).rg);

	#else

		return texture(normalBuffer, uv).xyz;

	#endif

}
