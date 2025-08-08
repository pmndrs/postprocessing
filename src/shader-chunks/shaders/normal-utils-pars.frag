/**
 * Reads a normal vector from a given buffer.
 *
 * @param normalBuffer - The normal texture.
 * @param uv - The texture coordinates.
 * @return The normal.
 */

vec3 readNormal(mediump sampler2D normalBuffer, const in vec2 uv) {

	return pp_decodeNormal(texture(normalBuffer, uv).xy);

}
