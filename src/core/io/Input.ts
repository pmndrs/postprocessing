import { BaseEvent, EventDispatcher, IUniform, Texture, UnsignedByteType } from "three";
import { GBuffer } from "../../enums/GBuffer.js";
import { GBufferSchema } from "../../utils/gbuffer/GBufferSchema.js";
import { MapExtensions } from "../../utils/MapExtensions.js";
import { ObservableMap } from "../../utils/ObservableMap.js";
import { ObservableSet } from "../../utils/ObservableSet.js";
import { SetExtensions } from "../../utils/SetExtensions.js";
import { ShaderData } from "../../utils/ShaderData.js";
import { BaseEventMap } from "../BaseEventMap.js";
import { Connectable } from "../Connectable.js";
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

export class Input extends EventDispatcher<InputEventMap> implements Connectable, ShaderData {

	/**
	 * Identifies the default input buffer in the {@link textures} collection.
	 */

	static readonly BUFFER_DEFAULT = "BUFFER_DEFAULT";

	/**
	 * An event listener that dispatches a `change` event.
	 */

	private readonly propagateChangeEvent: () => void;

	/**
	 * @see {@link gBufferSchema}
	 */

	private _gBufferSchema: GBufferSchema | null;

	/**
	 * Required input textures.
	 *
	 * {@link GBuffer.COLOR} is included by default.
	 */

	readonly requiredTextures: Set<string> & SetExtensions<string>;

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

		const requiredTextures = new ObservableSet<string>([GBuffer.COLOR]);
		requiredTextures.addEventListener("change", () => {

			this.dispatchEvent({ type: "change" });

		});

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

		this.requiredTextures = requiredTextures;
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

	set gBufferSchema(value: GBufferSchema | null) {

		if(this._gBufferSchema === value) {

			return;

		}

		this._gBufferSchema?.removeEventListener("change", this.propagateChangeEvent);
		value?.addEventListener("change", this.propagateChangeEvent);
		this._gBufferSchema = value;

		this.dispatchEvent({ type: "change" });

	}

	/**
	 * The default input buffer, or `undefined` if there is none.
	 */

	get defaultBuffer(): TextureResource | undefined {

		return this.textures.get(Input.BUFFER_DEFAULT);

	}

	set defaultBuffer(value: TextureResource | Texture | undefined) {

		if(value === undefined) {

			this.removeDefaultBuffer();

		} else {

			this.setBuffer(Input.BUFFER_DEFAULT, value);

		}

	}

	/**
	 * Removes the default buffer.
	 *
	 * @return True if the buffer existed and has been removed, or false if there is none.
	 */

	removeDefaultBuffer(): boolean {

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
	 * Sets the required textures.
	 *
	 * @internal
	 * @param values - The textures to use.
	 */

	setRequiredTextures(values: Set<string>): void {

		const current = this.requiredTextures;

		if(current.size === values.size && Array.from(current).every(x => values.has(x))) {

			return;

		}

		current.clear();
		current.addAll(...values);

	}

	/**
	 * Connects {@link requiredTextures | required textures} if they are provided by the given output.
	 *
	 * @param textures - The textures to connect.
	 */

	connectRequiredTextures(textures: Iterable<[string, TextureResource]>): void {

		this.textures.setAll(...Array.from(textures).filter(x => this.requiredTextures.has(x[0])));

	}

	/**
	 * Connects the given resources to this input.
	 *
	 * This method uses {@link connectRequiredTextures} internally to connect required textures.
	 *
	 * @param other - The resources to connect.
	 */

	connect(other: Output): void {

		this.connectRequiredTextures(other.textures());
		this.shaderData.connect(other.shaderData);

	}

	disconnect(other: Output): void {

		for(const [key, value] of other.textures()) {

			if(this.textures.get(key) === value) {

				this.textures.delete(key);

			}

		}

		this.shaderData.disconnect(other.shaderData);

	}

}
