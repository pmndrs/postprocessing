import { BaseEvent, EventListener, IUniform, Texture } from "three";
import { DisposableResource } from "./DisposableResource.js";
import type { RenderTargetResource } from "./RenderTargetResource.js";

/**
 * A texture resource wrapper.
 *
 * @category IO
 */

export class TextureResource extends DisposableResource<Readonly<Texture> | null> {

	/**
	 * A collection of `change` listeners for bound uniforms.
	 */

	private uniformListeners: WeakMap<IUniform, EventListener<BaseEvent<"change">, "change", this>>;

	/**
	 * @see {@link renderTarget}
	 */

	private _renderTarget: RenderTargetResource | null;

	/**
	 * Constructs a new texture resource.
	 *
	 * @param value - A texture.
	 */

	constructor(value: Texture | null = null) {

		super(value);

		this.uniformListeners = new WeakMap();
		this._renderTarget = null;

	}

	/**
	 * Alias for {@link value}.
	 */

	get texture(): Readonly<Texture> | null {

		return super.value;

	}

	/**
	 * A reference to the associated render target resource, or `null` if there is none.
	 */

	get renderTarget(): RenderTargetResource | null {

		return this._renderTarget;

	}

	/**
	 * Sets the render target resource.
	 *
	 * @internal
	 */

	setRenderTarget(value: RenderTargetResource | null): void {

		this._renderTarget = value;

	}

	/**
	 * Binds a uniform to this texture resource to keep its value up-to-date.
	 *
	 * Use {@link unbindUniform} before discarding the bound uniform to prevent memory leaks.
	 *
	 * @internal
	 * @param uniform - The uniform.
	 */

	bindUniform(uniform: IUniform): void {

		if(!this.uniformListeners.has(uniform)) {

			const listener = () => { uniform.value = this.value; };
			this.uniformListeners.set(uniform, listener);
			this.addEventListener("change", listener);

		}

		uniform.value = this.value;

	}

	/**
	 * Unbinds a uniform from this texture resource.
	 *
	 * @internal
	 * @param uniform - The uniform.
	 */

	unbindUniform(uniform: IUniform): void {

		if(this.uniformListeners.has(uniform)) {

			this.removeEventListener("change", this.uniformListeners.get(uniform)!);

		}

	}

}
