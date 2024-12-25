import { WebGLRenderTarget } from "three";
import { DisposableResource } from "./DisposableResource.js";
import { TextureResource } from "./TextureResource.js";

/**
 * A render target resource wrapper.
 *
 * @category IO
 */

export class RenderTargetResource extends DisposableResource<WebGLRenderTarget | null> {

	/**
	 * A live resource that wraps the texture of the current render target.
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

		// Note: Three automatically deletes textures and depth textures of a render target on dispose.
		super.value = value;
		this.texture.value = value !== null ? value.texture : null;

	}

}
