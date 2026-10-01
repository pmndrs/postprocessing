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

/**
 * Compares texture parameters.
 *
 * @param a - Texture parameters.
 * @param b - Texture parameters.
 * @return Whether the parameters are equal.
 * @category Utils
 * @internal
 */

export function textureParametersEqual(a: TextureParameters, b: TextureParameters): boolean {

	for(const key of Object.keys(a) as (keyof TextureParameters)[]) {

		if(a[key] !== b[key]) {

			return false;

		}

	}

	return true;

}
