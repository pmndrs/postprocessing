/**
 * An enumeration of G-Buffer components.
 *
 * The string values of the enum constants are used as shader macros.
 *
 * @group Enums
 */

export enum GBuffer {

	/**
	 * The albedo/diffuse color of the scene. Takes up one buffer, either 8 or 16 bit RGBA.
	 */

	COLOR = "GBUFFER_COLOR",

	/**
	 * The scene depth is stored in a 24 or 32 bit depth texture.
	 */

	DEPTH = "GBUFFER_DEPTH",

	/**
	 * The screen-space normals are stored in a 16-bit RGB buffer.
	 */

	NORMAL = "GBUFFER_NORMAL",

	/**
	 * Roughness is stored in the GREEN channel of an 8 bit RG buffer.
	 */

	METALNESS = "GBUFFER_METALNESS",

	/**
	 * Roughness is stored in the RED channel of an 8 bit RG buffer.
	 */

	ROUGHNESS = "GBUFFER_ROUGHNESS"

}
