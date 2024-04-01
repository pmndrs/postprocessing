/**
 * An enumeration of geometry data that is available to Effects.
 *
 * @category Enums
 * @internal
 */

export enum GData {

	/**
	 * The fragment color.
	 */

	COLOR = "color",

	/**
	 * The fragment depth.
	 */

	DEPTH = "depth",

	/**
	 * The view-space normal.
	 */

	NORMAL = "normal",

	/**
	 * Occlusion, roughness and metalness.
	 */

	ORM = "orm",

	/**
	 * The total emissive radiance.
	 */

	EMISSION = "emission",

	/**
	 * The fragment luminance.
	 */

	LUMINANCE = "luminance"

}
