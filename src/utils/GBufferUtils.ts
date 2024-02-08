import {
	AnyPixelFormat,
	FloatType,
	HalfFloatType,
	RGBAFormat,
	RGFormat,
	RedFormat,
	TextureDataType,
	UnsignedByteType,
	WebGLMultipleRenderTargets
} from "three";

import { GBuffer } from "../enums/GBuffer.js";
import { Precision } from "../enums/Precision.js";
import { GBufferConfig } from "./GBufferConfig.js";

/**
 * Maps texture data types to the GLSL precision modifiers.
 */

const textureTypeToPrecision = /* @__PURE__ */ new Map<TextureDataType, Precision>([
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

const pixelFormatToTexelType = /* @__PURE__ */ new Map<AnyPixelFormat, TexelType>([
	[RedFormat, "float"],
	[RGFormat, "vec2"],
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

export function extractIndices(renderTarget: WebGLMultipleRenderTargets): Map<string, number> {

	const validGBufferComponents = new Set<GBuffer>(Object.values(GBuffer));
	const indices = new Map<GBuffer | string, number>();

	for(let i = 0, l = renderTarget.texture.length; i < l; ++i) {

		const texture = renderTarget.texture[i];
		const gBufferComponent = texture.name as GBuffer;

		if(validGBufferComponents.has(gBufferComponent)) {

			indices.set(gBufferComponent, i);

		}

	}

	return indices;

}

/**
 * Extracts macro definitions that map G-Buffer texture names to shader output variables.
 *
 * @todo Remove when three supports auto shader outputs.
 * @param renderTarget - A render target.
 * @param gBufferConfig - A G-Buffer Configuration.
 * @return The macro definitions.
 * @category Utils
 * @internal
 */

export function extractDefines(renderTarget: WebGLMultipleRenderTargets,
	gBufferConfig: GBufferConfig): Map<string, string | number | boolean> {

	const defines = new Map<string, string | number | boolean>();

	for(let i = 0, l = renderTarget.texture.length; i < l; ++i) {

		const texture = renderTarget.texture[i];
		const gBufferComponent = texture.name as GBuffer;

		if(gBufferConfig.gBufferTextures.has(gBufferComponent)) {

			defines.set(gBufferConfig.gBufferTextures.get(gBufferComponent)!, `pc_FragData${i}`);

		}

	}

	return defines;

}

/**
 * Creates output definitions from a given render target.
 *
 * @todo Remove when three supports auto shader outputs.
 * @param renderTarget - A render target.
 * @return The output definitions.
 * @category Utils
 * @internal
 */

export function extractOutputDefinitions(renderTarget: WebGLMultipleRenderTargets): string {

	const definitions: string[] = [];

	for(let i = 0, l = renderTarget.texture.length; i < l; ++i) {

		const texture = renderTarget.texture[i];
		const precision = textureTypeToPrecision.get(texture.type);
		const type = pixelFormatToTexelType.get(texture.format);

		if(i === 0) {

			definitions.push("#ifndef gl_FragColor");

		}

		definitions.push(`layout(location = ${i}) out ${precision} ${type} pc_FragData${i};`);

		if(i === 0) {

			definitions.push("#define gl_FragColor pc_FragData${i}");
			definitions.push("#endif");

		}

	}

	return definitions.join("\n");

}
