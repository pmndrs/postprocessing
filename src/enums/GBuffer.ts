/**
 * An enumeration of G-Buffer components.
 *
 * @category Enums
 */

export enum GBuffer {

	/**
	 * The color of the scene. Takes up one buffer, either 8 or 16 bit RGBA.
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
	 * Ambient occlusion is stored in the RED channel of an 8 bit OcclusionRoughnessMetalness (RGB) buffer.
	 */

	OCCLUSION = "GBUFFER_OCCLUSION",

	/**
	 * Roughness is stored in the GREEN channel of an 8 bit OcclusionRoughnessMetalness (RGB) buffer.
	 */

	ROUGHNESS = "GBUFFER_ROUGHNESS",

	/**
	 * Metalness is stored in the BLUE channel of an 8 bit OcclusionRoughnessMetalness (RGB) buffer.
	 */

	METALNESS = "GBUFFER_METALNESS",

	/**
	 * The total emissive radiance. Takes up one buffer, either 8 or 16 bit RGBA.
	 */

	EMISSION = "GBUFFER_EMISSION"

}
