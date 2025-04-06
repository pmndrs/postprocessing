import {
	AnyPixelFormat,
	FloatType,
	HalfFloatType,
	RGBAFormat,
	RGBFormat,
	RGFormat,
	RedFormat,
	TextureDataType,
	UnsignedByteType,
	WebGLRenderTarget
} from "three";

import { Precision } from "../enums/Precision.js";

/**
 * Maps texture data types to the GLSL precision modifiers.
 */

const textureTypeToPrecision = new Map<TextureDataType, Precision>([
	[FloatType, "highp"],
	[HalfFloatType, "mediump"],
	[UnsignedByteType, "lowp"]
]);

/**
 * GLSL texel types.
 */

declare type TexelType = "float" | "vec2" | "vec4";

/**
 * Determines the GLSL texel type that corresponds to a given pixel format.
 *
 * @param type - The pixel format.
 * @return The GLSL texel type.
 */

const pixelFormatToTexelType = new Map<AnyPixelFormat, TexelType>([
	[RedFormat, "float"],
	[RGFormat, "vec2"],
	[RGBFormat, "vec4"],
	[RGBAFormat, "vec4"]
]);

/**
 * Extracts G-Buffer texture indices from a given render target.
 *
 * @param renderTarget - A render target.
 * @return A collection that maps G-Buffer components to texture indices.
 * @category Utils
 * @internal
 */

export function extractIndices(renderTarget: WebGLRenderTarget): Map<string, number> {

	const indices = new Map<string, number>();

	for(let i = 0, l = renderTarget.textures.length; i < l; ++i) {

		const texture = renderTarget.textures[i];
		indices.set(texture.name, i);

	}

	return indices;

}

/**
 * Creates output definitions from a given render target.
 *
 * TODO Remove when three supports auto shader outputs.
 *
 * @param renderTarget - A render target.
 * @return The output definitions.
 * @category Utils
 * @internal
 */

export function extractOutputDefinitions(renderTarget: WebGLRenderTarget): string {

	const definitions: string[] = [];

	for(let i = 0, l = renderTarget.textures.length; i < l; ++i) {

		const texture = renderTarget.textures[i];
		const precision = textureTypeToPrecision.get(texture.type);
		const type = pixelFormatToTexelType.get(texture.format);
		const name = texture.name.replace(/\W*/g, "");

		if(i === 0) {

			definitions.push("#ifndef gl_FragColor");

		}

		definitions.push(`layout(location = ${i}) out ${precision} ${type} out_FragData${i};`);

		if(name !== "") {

			definitions.push(`#define out_${name} out_FragData${i}`);

		}

		if(i === 0) {

			definitions.push(`#define gl_FragColor out_FragData${i}`);
			definitions.push("#endif");

		}

	}

	return definitions.join("\n");

}
