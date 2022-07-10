const DEG2RAD = Math.PI / 180.0;
const RAD2DEG = 180.0 / Math.PI;

/**
 * Converts horizontal FoV to vertical FoV.
 *
 * @param horizontalFoV - The horizontal field of view.
 * @param aspect - The aspect ration.
 * @return The vertical field of view.
 */

export function calculateVerticalFoV(horizontalFoV, aspect = 16 / 9) {

	return Math.atan(Math.tan(horizontalFoV * DEG2RAD * 0.5) / aspect) * RAD2DEG * 2.0;

}

/**
 * Converts vertical FoV to horizontal FoV.
 *
 * @param verticalFoV - The vertical field of view.
 * @param aspect - The aspect ration.
 * @return The horizontal field of view.
 */

export function calculateHorizontalFoV(verticalFoV, aspect = 16 / 9) {

	return Math.atan(Math.tan(verticalFoV * DEG2RAD * 0.5) * aspect) * RAD2DEG * 2.0;

}
