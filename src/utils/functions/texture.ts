import {
	FloatType,
	HalfFloatType,
	TextureDataType,
	TextureParameters,
	UnsignedInt101111Type
} from "three";

/**
 * Checks whether the given texture type uses high precision.
 *
 * @param type - The texture type.
 * @return Whether the type uses high precision.
 * @category Utils
 * @internal
 */

export function isHighPrecision(type?: TextureDataType): boolean {

	return (type === HalfFloatType || type === FloatType || type === UnsignedInt101111Type);

}

