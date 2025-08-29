/**
 * An enumeration of CDL presets for different looks.
 *
 * @category Enums
 */

export enum CDLPreset {

	/**
	 * The baseline look.
	 *
	 * Good for testing, but not well suited for production use due to flat colors.
	 */

	DEFAULT,

	/**
	 * A warmer look with more vivid colors.
	 */

	GOLDEN,

	/**
	 * Punchy colors with more saturation and higher contrast.
	 */

	PUNCHY,

	/**
	 * Adjusted for production use to have a similar feeling of contrast as ACES over a wide range of scenes.
	 */

	NEEDLE,

	/**
	 * A mellow look for a vintage appearance.
	 */

	SEPIA,

	/**
	 * A fully desaturated look.
	 */

	GRAYSCALE

}
