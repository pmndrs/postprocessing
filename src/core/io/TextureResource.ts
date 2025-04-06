import { BaseEvent, EventListener, Texture, Uniform } from "three";
import { DisposableResource } from "./DisposableResource.js";

/**
 * A texture resource wrapper.
 *
 * @category IO
 */

export class TextureResource extends DisposableResource<Texture | null> {

	/**
	 * A collection of `change` listeners for bound uniforms.
	 */

	private uniformListeners: WeakMap<Uniform, EventListener<BaseEvent<string>, "change", this>>;

	/**
	 * Constructs a new texture resource.
	 *
	 * @param value - A texture.
	 */

	constructor(value: Texture | null = null) {

		super(value);

		this.uniformListeners = new WeakMap<Uniform, EventListener<BaseEvent<string>, "change", this>>();

	}

	/**
	 * Binds a uniform to this texture resource to keep its value up-to-date.
	 *
	 * Please use {@link unbindUniform} in case you want to discard the bound uniform to prevent memory leaks.
	 *
	 * @param uniform - The uniform.
	 */

	bindUniform(uniform: Uniform): void {

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
	 * @param uniform - The uniform.
	 */

	unbindUniform(uniform: Uniform): void {

		if(this.uniformListeners.has(uniform)) {

			this.removeEventListener("change", this.uniformListeners.get(uniform)!);

		}

	}

}
