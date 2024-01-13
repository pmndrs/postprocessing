import { WebGLMultipleRenderTargets } from "three";
import { GBuffer } from "../enums/GBuffer.js";
import { GBufferTexture } from "../enums/GBufferTexture.js";

/**
 * G-Buffer meta data.
 *
 * @category Utils
 * @internal
 */

export class GBufferInfo {

	/**
	 * A collection that maps G-Buffer texture IDs to atomic G-Buffer components.
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
	 * Constructs new G-Buffer meta infos.
	 *
	 * @param renderTarget - A render target.
	 */

	constructor(renderTarget: WebGLMultipleRenderTargets) {

		this.indices = new Map<GBuffer, number>();
		this.defines = new Map<string, string | number | boolean>();
		this.extractIndices(renderTarget);

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

			this.defines.set(`LOCATION_${gBufferTexture.toUpperCase()}`, i);

			for(const component of components) {

				this.indices.set(component, i);

			}

		}

	}

}
