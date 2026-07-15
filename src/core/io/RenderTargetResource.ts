import { RenderTargetOptions, WebGLRenderTarget } from "three";
import { RenderTargetDescriptor } from "../../utils/RenderTargetDescriptor.js";
import { TextureResource } from "./TextureResource.js";
import { DisposableResource } from "./DisposableResource.js";
import { Resolution } from "../../utils/Resolution.js";

/**
 * A managed offscreen render target resource.
 *
 * @category IO
 */

export class RenderTargetResource extends DisposableResource<Readonly<WebGLRenderTarget> | null> {

	/**
	 * A live resource that references the texture of the current render target.
	 */

	readonly texture: TextureResource;

	/**
	 * The resolution of this render target.
	 *
	 * Defaults to the resolution of the associated pass.
	 */

	readonly resolution: Resolution;

	/**
	 * The current render target descriptor.
	 *
	 * The actual render target is made available through the resource {@link value}.
	 */

	readonly descriptor: RenderTargetDescriptor;

	/**
	 * Constructs a new render target resource.
	 *
	 * @param options - Render target options.
	 */

	constructor(options: RenderTargetOptions = {}) {

		super(null);

		this.texture = new TextureResource();
		this.resolution = new Resolution();

		this.descriptor = new RenderTargetDescriptor(options);
		this.descriptor.addEventListener("change", () => this.setChanged());

	}

	override get value(): Readonly<WebGLRenderTarget> | null {

		return super.value;

	}

	/**
	 * An alias for {@link value}.
	 */

	get renderTarget(): Readonly<WebGLRenderTarget> | null {

		return super.value;

	}

	/**
	 * Sets the render target.
	 *
	 * @internal
	 */

	setRenderTarget(value: WebGLRenderTarget | null): void {

		super.value = value;
		this.texture.value = value?.texture ?? null;

	}

}
