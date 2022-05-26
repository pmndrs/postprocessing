/**
 * An enumeration of depth test strategies.
 *
 * @type {Object}
 * @property {Number} DEFAULT - Perform depth test only.
 * @property {Number} KEEP_MAX_DEPTH - Always keep max depth.
 * @property {Number} DISCARD_MAX_DEPTH - Always discard max depth.
 */

export const DepthTestStrategy = {
	DEFAULT: 0,
	KEEP_MAX_DEPTH: 1,
	DISCARD_MAX_DEPTH: 2
};
