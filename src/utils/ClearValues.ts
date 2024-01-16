import { Color, Vector3 } from "three";

/**
 * A collection of clear values.
 *
 * @category Utils
 */

export class ClearValues {

	/**
	 * A clear color that overrides the clear color of the renderer.
	 *
	 * @defaultValue null
	 */

	color: Color | null;

	/**
	 * A clear alpha value that overrides the clear alpha of the renderer.
	 *
	 * @defaultValue null
	 */

	alpha: number | null;

	/**
	 * The clear value for the normal buffer.
	 */

	normal: Vector3;

	/**
	 * The clear value for roughness.
	 */

	roughness: number;

	/**
	 * The clear value for metalness.
	 */

	metalness: number;

	/**
	 * Constructs new clear values.
	 */

	constructor() {

		this.color = null;
		this.alpha = null;
		this.normal = new Vector3(0.5, 0.5, 1);
		this.roughness = 0;
		this.metalness = 0;

	}

}
