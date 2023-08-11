const unpackFactors = new Float32Array([
	(255 / 256) / (256 ** 3),
	(255 / 256) / (256 ** 2),
	(255 / 256) / 256,
	(255 / 256)
]);

/**
 * Unpacks an RGBA-encoded float value.
 *
 * @param packedDepth - The packed float.
 * @return The unpacked float.
 * @group Utils
 */

export function unpackRGBAToFloat(packedDepth: Uint8Array): number {

	return (
		packedDepth[0] * unpackFactors[0] +
		packedDepth[1] * unpackFactors[1] +
		packedDepth[2] * unpackFactors[2] +
		packedDepth[3] * unpackFactors[3]
	) / 255;

}
