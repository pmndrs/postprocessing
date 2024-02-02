import {
	AnyPixelFormat,
	FloatType,
	HalfFloatType,
	RGFormat,
	RedFormat,
	TextureDataType,
	WebGLMultipleRenderTargets
} from "three";

import { GBuffer } from "../enums/GBuffer.js";
import { GBufferTexture } from "../enums/GBufferTexture.js";
import { Precision } from "../enums/Precision.js";

/**
 * Determines the GLSL precision that corresponds to a given texture type.
 *
 * @param type - The texture type.
 * @return The GLSL precision.
 */

function getPrecision(type: TextureDataType): Precision {

	switch(type) {

		case FloatType:
			return "highp";

		case HalfFloatType:
			return "mediump";

		default:
			return "lowp";

	}

}

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

function getTexelType(format: AnyPixelFormat): TexelType {

	switch(format) {

		case RedFormat:
			return "float";

		case RGFormat:
			return "vec2";

		default:
			return "vec4";

	}

}

/**
 * G-Buffer meta data.
 *
 * @category Utils
 * @internal
 */

export class GBufferInfo {

	/**
	 * A collection that maps G-Buffer texture IDs to G-Buffer components.
	 */

	private static readonly gBufferComponents = /* @__PURE__ */ new Map<GBufferTexture, GBuffer[]>([
		[GBufferTexture.COLOR, [GBuffer.COLOR]],
		[GBufferTexture.NORMAL, [GBuffer.NORMAL]],
		[GBufferTexture.ROUGHNESS_METALNESS, [GBuffer.ROUGHNESS, GBuffer.METALNESS]]
	]);

	/**
	 * A collection that maps G-Buffer components to texture indices.
	 */

	readonly indices: Map<GBuffer, number>;

	/**
	 * Macro definitions that contain the following information:
	 *
	 * - `LOCATION_${gBufferTextureUpperCase}`: `index`
	 */

	readonly defines: Map<string, string | number | boolean>;

	/**
	 * @see {@link outputDefinitions}
	 */

	private _outputDefinitions: string | null;

	/**
	 * Constructs new G-Buffer meta infos.
	 *
	 * @param renderTarget - A render target.
	 */

	constructor(renderTarget: WebGLMultipleRenderTargets) {

		this.indices = new Map<GBuffer, number>();
		this.defines = new Map<string, string | number | boolean>();
		this._outputDefinitions = null;

		this.extractIndices(renderTarget);
		this.extractOutputDefinitions(renderTarget);

	}

	/**
	 * Shader output definitions.
	 */

	get outputDefinitions(): string {

		return this._outputDefinitions as string;

	}

	/**
	 * Extracts G-Buffer component indices from a given render target.
	 *
	 * @param renderTarget - A render target.
	 */

	private extractIndices(renderTarget: WebGLMultipleRenderTargets): void {

		for(let i = 0, l = renderTarget.texture.length; i < l; ++i) {

			const texture = renderTarget.texture[i];
			const gBufferTexture = texture.name as GBufferTexture;
			const components = GBufferInfo.gBufferComponents.get(gBufferTexture);

			if(components === undefined) {

				continue;

			}

			// TODO remove when three supports auto shader outputs.
			this.defines.set(gBufferTexture, `pc_FragData${i}`);

			for(const component of components) {

				this.indices.set(component, i);

			}

		}

	}

	/**
	 * Creates output definitions from a given render target.
	 *
	 * @param renderTarget - A render target.
	 */

	private extractOutputDefinitions(renderTarget: WebGLMultipleRenderTargets): void {

		const definitions: string[] = [];

		for(let i = 0, l = renderTarget.texture.length; i < l; ++i) {

			const texture = renderTarget.texture[i];
			const precision = getPrecision(texture.type);
			const type = getTexelType(texture.format);

			if(i === 0) {

				// TODO remove when three supports auto shader outputs.
				definitions.push("#ifndef gl_FragColor");

			}

			definitions.push(`layout(location = ${i}) out ${precision} ${type} pc_FragData${i};`);

			if(i === 0) {

				definitions.push("#define gl_FragColor pc_FragData${i}");
				definitions.push("#endif");

			}

		}

		this._outputDefinitions = definitions.join("\n");

	}

}
