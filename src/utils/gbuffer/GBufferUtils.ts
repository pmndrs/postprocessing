import {
	FloatType,
	HalfFloatType,
	IntType,
	ShortType,
	Texture,
	UnsignedIntType,
	UnsignedShortType,
	WebGLRenderTarget
} from "three";

import { Precision } from "../../enums/Precision.js";

/**
 * Maps texture data types to the GLSL precision modifiers.
 *
 * @param texture - A texture.
 * @return The GLSL precision.
 */

function getOutputPrecision(texture: Texture): Precision {

	switch(texture.type) {

		case IntType:
		case UnsignedIntType:
		case FloatType:
			return "highp";

		case ShortType:
		case UnsignedShortType:
		case HalfFloatType:
			return "mediump";

		default:
			return "lowp";

	}

}

/**
 * GLSL texel types.
 */

declare type TexelType = "uvec4" | "ivec4" | "vec4";

/**
 * Determines the GLSL texel type that corresponds to a given pixel format.
 *
 * @param texture - A texture.
 * @return The GLSL texel type.
 */

function getOutputType(texture: Texture): TexelType {

	const isIntType = texture.type === IntType || texture.type === ShortType;
	const isUintType = texture.type === UnsignedIntType || texture.type === UnsignedShortType;

	// Using vec4 for best compatibility and flexibility.
	return isUintType ? "uvec4" : isIntType ? "ivec4" : "vec4";

}

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
 * @see https://github.com/mrdoob/three.js/pull/27808
 * @param renderTarget - A render target.
 * @return The output definitions.
 * @category Utils
 * @internal
 */

export function extractOutputDefinitions(renderTarget: WebGLRenderTarget): string {

	const definitions: string[] = [];

	for(let i = 0, l = renderTarget.textures.length; i < l; ++i) {

		const texture = renderTarget.textures[i];
		const name = texture.name.replace(/\W*/g, "");
		const precision = getOutputPrecision(texture);
		const type = getOutputType(texture);

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

/**
 * Ensures that the given shader writes default values to the G-Buffer.
 *
 * @param shader - A shader.
 * @return The modified shader.
 * @internal
 */

export function addGBufferDefaultOutput(shader: string): string {

	if(!shader.includes("pp_normal_codec_pars_fragment")) {

		shader = shader.replace(
			/(void\s+main\(\)\s+{)/,
			"\n#include <pp_normal_codec_pars_fragment>\n$1"
		);

	}

	if(!shader.includes("pp_gbuffer_default_output_fragment")) {

		const usesClippingPlanes = shader.includes("clipping_planes_fragment");

		shader = shader.replace(
			usesClippingPlanes ? /(#include\s+<clipping_planes_fragment>)/ : /(void\s+main\(\)\s+{)/,
			"$1\n#include <pp_gbuffer_default_output_fragment>\n"
		);

	}

	return shader;

}
