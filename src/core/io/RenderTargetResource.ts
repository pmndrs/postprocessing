import { WebGLRenderTarget } from "three";
import { Resource } from "./Resource.js";
import { TextureResource } from "./TextureResource.js";

/**
 * A render target resource wrapper.
 *
 * @category IO
 */

export class RenderTargetResource extends Resource<WebGLRenderTarget | null> {

	/**
	 * A live resource that wraps the texture of the render target.
	 */

	readonly texture: TextureResource;

	/**
	 * Constructs a new render target resource.
	 *
	 * @param value - A render target.
	 */

	constructor(value: WebGLRenderTarget | null = null) {

		super(value);

		this.texture = new TextureResource(this.value?.texture);

	}

	override get value(): WebGLRenderTarget | null {

		return super.value;

	}

	override set value(value: WebGLRenderTarget | null) {

		super.value = value;
		this.texture.value = value !== null ? value.texture : null;

	}

}
