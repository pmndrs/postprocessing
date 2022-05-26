/**
 * An enumeration of depth copy modes.
 *
 * @type {Object}
 * @property {Number} FULL - Copies the full depth texture every frame.
 * @property {Number} SINGLE - Copies a single texel from the depth texture on demand.
 */

export const DepthCopyMode = {
	FULL: 0,
	SINGLE: 1
};
