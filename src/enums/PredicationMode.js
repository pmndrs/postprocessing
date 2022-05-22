/**
 * An enumeration of SMAA predication modes.
 *
 * @type {Object}
 * @property {Number} DISABLED - No predicated thresholding.
 * @property {Number} DEPTH - Depth-based predicated thresholding.
 * @property {Number} CUSTOM - Predicated thresholding using a custom buffer.
 */

export const PredicationMode = {
	DISABLED: 0,
	DEPTH: 1,
	CUSTOM: 2
};
