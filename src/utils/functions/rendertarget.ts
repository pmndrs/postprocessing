import { ColorSpace, DepthTexture, SRGBColorSpace, WebGL3DRenderTarget, WebGLRenderTarget } from "three";
import { RenderTargetDescriptor } from "../RenderTargetDescriptor.js";
import { GBuffer } from "../../enums/GBuffer.js";
import { isHighPrecision } from "./texture.js";

/**
 * Creates a new render target based on the given descriptor.
 *
 * @param resource - A render target resource.
 * @param activeTextures - Texture attachments that have active consumers.
 * @return The new render target.
 * @category Utils
 * @internal
 */

export function createRenderTarget(descriptor: RenderTargetDescriptor, activeTextures: string[],
	outputColorSpace: ColorSpace): WebGLRenderTarget {

	const depth = descriptor.options.depth ?? 1;
	const renderTarget = (depth > 1) ?
		new WebGL3DRenderTarget(1, 1, depth, descriptor.options) :
		new WebGLRenderTarget(1, 1, descriptor.options);

	// Get the templates for the required textures (depth is handled separately).
	const textureTemplates = descriptor.textures
		.filter(x => x.name !== undefined && activeTextures.includes(x.name) && x.name !== GBuffer.DEPTH as string);

	for(let i = 0, l = textureTemplates.length; i < l; ++i) {

		const texture = renderTarget.textures[i];
		const textureTemplate = textureTemplates[i];
		texture.name = textureTemplate.name ?? "Unknown";
		texture.setValues(textureTemplate.values);

	}

	if(descriptor.options.colorSpace !== undefined) {

		// If the buffer uses low precision, enable sRGB encoding to reduce information loss.
		if(!isHighPrecision(renderTarget.texture.type) && outputColorSpace === SRGBColorSpace) {

			renderTarget.texture.colorSpace = SRGBColorSpace;

		}

	}

	// Handle depth.
	const depthTexture = descriptor.options.depthTexture ?? null;

	if(depthTexture !== null) {

		// Depth texture override (shared depth).
		renderTarget.depthTexture = depthTexture;

	} else {

		const depthTextureTemplate = descriptor.textures.find(x => x.name === GBuffer.DEPTH as string);

		if(depthTextureTemplate === undefined || !activeTextures.includes(GBuffer.DEPTH)) {

			renderTarget.depthTexture = null;

		} else {

			const texture = new DepthTexture();
			texture.name = depthTextureTemplate.name ?? GBuffer.DEPTH;
			texture.setValues(depthTextureTemplate.values);
			renderTarget.depthTexture = texture;

		}

	}

	return renderTarget;

}
