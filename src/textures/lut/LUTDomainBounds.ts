import { Vector3 } from "three";

/**
 * LUT input domain bounds.
 *
 * @category Textures
 */

export interface LUTDomainBounds {

	/**
	 * The lower bounds of the input domain.
	 */

	domainMin: Vector3;

	/**
	 * The upper bounds of the input domain.
	 */

	domainMax: Vector3;

}
