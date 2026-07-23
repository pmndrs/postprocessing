import { EventDispatcher, type RenderTargetOptions, type TextureParameters } from "three";
import { BaseEventMap } from "../core/BaseEventMap.js";
import { MapExtensions } from "./MapExtensions.js";
import { ObservableMap } from "./ObservableMap.js";
import { defaultRenderTargetOptions } from "./objects/defaultRenderTargetOptions.js";

/**
 * A render target descriptor.
 *
 * The property defaults correspond to those of `WebGLRenderTarget`.
 *
 * @category Utils
 */

export class RenderTargetDescriptor extends EventDispatcher<BaseEventMap> implements RenderTargetOptions {

	mapping?: RenderTargetOptions["mapping"];
	wrapS?: RenderTargetOptions["wrapS"];
	wrapT?: RenderTargetOptions["wrapT"];
	wrapR?: RenderTargetOptions["wrapR"];
	format?: RenderTargetOptions["format"];
	internalFormat?: RenderTargetOptions["internalFormat"];
	type?: RenderTargetOptions["type"];
	colorSpace?: RenderTargetOptions["colorSpace"];
	magFilter?: RenderTargetOptions["magFilter"];
	minFilter?: RenderTargetOptions["minFilter"];
	anisotropy?: RenderTargetOptions["anisotropy"];
	flipY?: RenderTargetOptions["flipY"];
	generateMipmaps?: RenderTargetOptions["generateMipmaps"];
	depthBuffer?: RenderTargetOptions["depthBuffer"];
	stencilBuffer?: RenderTargetOptions["stencilBuffer"];
	resolveDepthBuffer?: RenderTargetOptions["resolveDepthBuffer"];
	resolveStencilBuffer?: RenderTargetOptions["resolveStencilBuffer"];
	depthTexture?: RenderTargetOptions["depthTexture"];
	samples?: RenderTargetOptions["samples"];
	count?: RenderTargetOptions["count"];
	depth?: RenderTargetOptions["depth"];
	multiview?: RenderTargetOptions["multiview"];
	useArrayDepthTexture?: RenderTargetOptions["useArrayDepthTexture"];

	/**
	 * The name of the primary texture attachment.
	 */

	name?: string;

	/**
	 * A collection of texture configurations organized by name.
	 */

	textures: Map<string, TextureParameters> & MapExtensions<string, TextureParameters>;

	/**
	 * Controls whether events will be dispatched.
	 */

	private muted: boolean;

	/**
	 * Constructs a new render target descriptor.
	 *
	 * @param options - The options.
	 */

	constructor(options?: RenderTargetOptions) {

		super();

		this.muted = false;

		const textures = new ObservableMap<string, TextureParameters>();
		textures.addEventListener("change", () => this.setChanged());
		this.textures = textures;

		Object.assign(this, defaultRenderTargetOptions, options);

		return new Proxy(this, {
			set(target, property, value, receiver) {

				if(Reflect.get(target, property, receiver) === value) {

					return true;

				}

				const result = Reflect.set(target, property, value, receiver);

				if(typeof property !== "string" || !property.startsWith("_")) {

					target.setChanged();

				}

				return result;

			}
		});

	}

	/**
	 * Dispatches a `change` event.
	 */

	private setChanged(): void {

		if(this.muted) {

			return;

		}

		this.dispatchEvent({ type: "change" });

	}

	/**
	 * Sets multiple options at once.
	 *
	 * @param values - The values to apply.
	 */

	setValues(values: RenderTargetOptions): void {

		this.muted = true;
		Object.assign(this, defaultRenderTargetOptions, values);
		this.muted = false;
		this.setChanged();

	}

	/**
	 * Creates a new descriptor that equals this one.
	 *
	 * @return The clone.
	 */

	clone(): RenderTargetDescriptor {

		return new RenderTargetDescriptor(this);

	}

}
