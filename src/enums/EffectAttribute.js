/**
 * An enumeration of effect attributes.
 *
 * Attributes can be concatenated using the bitwise OR operator.
 *
 * @type {Object}
 * @property {Number} NONE - No attributes. Most effects don't need to specify any attributes.
 * @property {Number} DEPTH - Describes effects that require a depth texture.
 * @property {Number} CONVOLUTION - Describes effects that fetch additional samples from the input buffer. There cannot be more than one effect with this attribute per {@link EffectPass}.
 * @example const attributes = EffectAttribute.CONVOLUTION | EffectAttribute.DEPTH;
 */

export const EffectAttribute = {
	NONE: 0,
	DEPTH: 1,
	CONVOLUTION: 2
};
