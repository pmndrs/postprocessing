import { BaseEvent, EventDispatcher, IUniform, Texture, UnsignedByteType } from "three";
import { GBufferSchema } from "../../utils/gbuffer/GBufferSchema.js";
import { MapExtensions } from "../../utils/MapExtensions.js";
import { ObservableMap } from "../../utils/ObservableMap.js";
import { ShaderData } from "../../utils/ShaderData.js";
import { BaseEventMap } from "../BaseEventMap.js";
import type { Output } from "./Output.js";
import { ShaderDataResource } from "./ShaderDataResource.js";
import { TextureResource } from "./TextureResource.js";

/**
 * Input events.
 *
 * @category IO
 */

export interface InputEventMap extends BaseEventMap {

	/**
	 * Triggers when the input textures have changed.
	 *
	 * @event
	 */

	texturechange: BaseEvent<"texturechange">;

	/**
	 * Triggers when the input shader data has changed.
	 *
	 * @event
	 */

	shaderdatachange: BaseEvent<"shaderdatachange">;

}

/**
 * Input resources.
 *
 * @category IO
 */

export class Input extends EventDispatcher<InputEventMap> implements ShaderData {

	/**
	 * Identifies the default input buffer in the {@link textures} collection.
	 */

	static readonly BUFFER_DEFAULT = "default";

	/**
	 * An event listener that dispatches a `change` event.
	 */

	private readonly propagateChangeEvent: () => void;

	/**
	 * @see {@link gBufferSchema}
	 */

	private _gBufferSchema: GBufferSchema | null;

	/**
	 * Input textures.
	 */

	readonly textures: Map<string, TextureResource> & MapExtensions<string, TextureResource>;

	/**
	 * Input shader data.
	 */

	readonly shaderData: ShaderDataResource;

	/**
	 * Constructs new input resources.
	 */

	constructor() {

		super();

		this.propagateChangeEvent = () => this.dispatchEvent({ type: "change" });
		this._gBufferSchema = null;

		const textures = new ObservableMap<string, TextureResource>();
		textures.addEventListener("change", () => {

			this.dispatchEvent({ type: "texturechange" });
			this.dispatchEvent({ type: "change" });

		});

		const shaderData = new ShaderDataResource();
		shaderData.addEventListener("change", () => {

			this.dispatchEvent({ type: "shaderdatachange" });
			this.dispatchEvent({ type: "change" });

		});

		this.textures = textures;
		this.shaderData = shaderData;

	}

	get defines(): Map<string, string | number | boolean> & MapExtensions<string, string | number | boolean> {

		return this.shaderData.defines;

	}

	get uniforms(): Map<string, IUniform> & MapExtensions<string, IUniform> {

		return this.shaderData.uniforms;

	}

	/**
	 * Alias for {@link textures}.
	 */

	get buffers(): typeof this.textures {

		return this.textures;

	}

	/**
	 * Indicates whether the default buffer uses high precision.
	 */

	get frameBufferPrecisionHigh(): boolean {

		return (this.defaultBuffer?.value?.type !== UnsignedByteType);

	}

	/**
	 * The current G-Buffer schema, or `null` if there is none.
	 */

	get gBufferSchema(): GBufferSchema | null {

		return this._gBufferSchema;

	}

	/**
	 * The default input buffer, or `undefined` if there is none.
	 */

	get defaultBuffer(): TextureResource | undefined {

		return this.textures.get(Input.BUFFER_DEFAULT);

	}

	set defaultBuffer(value: TextureResource | Texture | undefined) {

		if(value === undefined) {

			this.deleteDefaultBuffer();

		} else {

			this.setBuffer(Input.BUFFER_DEFAULT, value);

		}

	}

	/**
	 * Removes the default buffer.
	 *
	 * @return True if the buffer existed and has been removed, or false if there is none.
	 */

	deleteDefaultBuffer(): boolean {

		return this.textures.delete(Input.BUFFER_DEFAULT);

	}

	/**
	 * Sets a texture resource or creates a new one.
	 *
	 * Raw textures will automatically be wrapped in a new resource.
	 *
	 * @param key - The key of the buffer.
	 * @param value - The buffer.
	 * @return The texture resource.
	 */

	setBuffer(key: string, value: TextureResource | Texture | null): TextureResource {

		const resource = (value instanceof TextureResource) ? value : new TextureResource(value);
		this.textures.set(key, resource);
		return resource;

	}

	/**
	 * Adds the given resources to this input.
	 *
	 * @param output - The resources to add.
	 */

	add(output: Output): void {

		const defaultBuffer = output.defaultBuffer?.texture;

		if(defaultBuffer !== undefined) {

			this.defaultBuffer = defaultBuffer;

		}

		this.textures.setAll(...output.textures());
		this.shaderData.add(output.shaderData);

	}

	/**
	 * Removes the given resources from this input.
	 *
	 * @param output - The resources to remove.
	 */

	remove(output: Output): void {

		const defaultBuffer = output.defaultBuffer?.texture;

		if(defaultBuffer !== undefined && this.defaultBuffer === defaultBuffer) {

			this.deleteDefaultBuffer();

		}

		for(const [key, value] of output.textures()) {

			if(this.textures.get(key) === value) {

				this.textures.delete(key);

			}

		}

		this.shaderData.remove(output.shaderData);

	}

	// #region Internal

	/**
	 * Sets the G-Buffer schema.
	 *
	 * @internal
	 * @param value - The schema.
	 */

	setGBufferSchema(value: GBufferSchema | null): void {

		if(this._gBufferSchema === value) {

			return;

		}

		this._gBufferSchema?.removeEventListener("change", this.propagateChangeEvent);
		value?.addEventListener("change", this.propagateChangeEvent);
		this._gBufferSchema = value;

		this.dispatchEvent({ type: "change" });

	}

	// #endregion

}
