import { BaseEvent, EventDispatcher, IUniform, Texture, UnsignedByteType } from "three";
import { GBuffer } from "../../enums/GBuffer.js";
import { CompositeMap } from "../../utils/CompositeMap.js";
import { ObservableSet } from "../../utils/ObservableSet.js";
import { SetExtensions } from "../../utils/SetExtensions.js";
import { ShaderData } from "../../utils/ShaderData.js";
import { BaseEventMap } from "../BaseEventMap.js";
import { Connectable } from "../Connectable.js";
import { Disposable } from "../Disposable.js";
import type { Output } from "./Output.js";
import { RenderTargetResource } from "./RenderTargetResource.js";
import { ShaderDataResource } from "./ShaderDataResource.js";
import { TextureResource } from "./TextureResource.js";
import { MapExtensions } from "../../utils/MapExtensions.js";

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

	/**
	 * Triggers when the input G-Buffer components have changed.
	 *
	 * @event
	 */

	gbufferchange: BaseEvent<"gbufferchange">;

}

/**
 * Input resources.
 *
 * @category IO
 */

export class Input extends EventDispatcher<InputEventMap> implements Connectable, Disposable, ShaderData {

	/**
	 * Identifies the default input buffer in the {@link textures} collection.
	 */

	static readonly BUFFER_DEFAULT = "BUFFER_DEFAULT";

	/**
	 * Required {@link GBuffer} components.
	 *
	 * {@link GBuffer.COLOR} is included by default.
	 */

	readonly gBuffer: Set<string> & SetExtensions<string>;

	/**
	 * Input textures.
	 */

	readonly textures: Map<string, TextureResource>;

	/**
	 * Input shader data.
	 */

	readonly shaderData: ShaderDataResource;

	/**
	 * Constructs new input resources.
	 */

	constructor() {

		super();

		const gBuffer = new ObservableSet<GBuffer>([GBuffer.COLOR]);
		gBuffer.addEventListener("change", () => {

			this.dispatchEvent({ type: "gbufferchange" });
			this.dispatchEvent({ type: "change" });

		});

		const textures = new CompositeMap<string, TextureResource>();
		const observedTextures = new Set<TextureResource>();

		const textureListener = () => {

			this.dispatchEvent({ type: "texturechange" });
			this.dispatchEvent({ type: "change" });

		};

		const syncTextureListeners = () => {

			const currentTextures = new Set(textures.values());

			for(const texture of observedTextures) {

				if(!currentTextures.has(texture)) {

					texture.removeEventListener("change", textureListener);
					observedTextures.delete(texture);

				}

			}

			for(const texture of currentTextures) {

				if(!observedTextures.has(texture)) {

					texture.addEventListener("change", textureListener);
					observedTextures.add(texture);

				}

			}

		};

		textures.addEventListener("change", () => {

			syncTextureListeners();
			textureListener();

		});

		const shaderData = new ShaderDataResource();
		shaderData.addEventListener("change", () => {

			this.dispatchEvent({ type: "shaderdatachange" });
			this.dispatchEvent({ type: "change" });

		});

		this.gBuffer = gBuffer;
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
	 * An alias for {@link textures}.
	 */

	get buffers(): Map<string, TextureResource> {

		return this.textures;

	}

	/**
	 * Indicates whether the default buffer uses high precision.
	 */

	get frameBufferPrecisionHigh(): boolean {

		return (this.defaultBuffer?.value?.type !== UnsignedByteType);

	}

	/**
	 * The default input buffer, or `null` if there is none.
	 */

	get defaultBuffer(): TextureResource | null {

		return this.textures.get(Input.BUFFER_DEFAULT) ?? null;

	}

	set defaultBuffer(value: RenderTargetResource | TextureResource | Texture | null) {

		const texture = (value instanceof RenderTargetResource) ? value.texture : value;
		this.setBuffer(Input.BUFFER_DEFAULT, texture);

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
	 * Retrieves a buffer.
	 *
	 * @param key - A buffer key.
	 * @return The buffer, or `undefined` if it doesn't exist.
	 */

	getBuffer(key: string): TextureResource | undefined {

		return this.textures.get(key);

	}

	/**
	 * Sets a buffer.
	 *
	 * Raw textures will automatically be wrapped in a new resource.
	 *
	 * @param key - A buffer key.
	 * @param value - The buffer.
	 * @return The texture resource.
	 */

	setBuffer(key: string, value: TextureResource | Texture | null): TextureResource {

		const resource = value instanceof TextureResource ? value : new TextureResource(value);
		this.textures.set(key, resource);
		return resource;

	}

	/**
	 * Connects an output as an inherited input source.
	 *
	 * Textures, defines and uniforms from the given output become available through this input.
	 * Local input resources override connected resources with the same key.
	 *
	 * @param other - The output to inherit resources from.
	 */

	connect(other: Output): void {

		const textures = this.textures as CompositeMap<string, TextureResource>;

		textures.connect(other.textures);
		this.shaderData.connect(other.shaderData);

	}

	disconnect(other: Output): void {

		const textures = this.textures as CompositeMap<string, TextureResource>;

		textures.disconnect(other.textures);
		this.shaderData.disconnect(other.shaderData);

	}

	dispose(): void {

		const textures = this.textures as CompositeMap<string, TextureResource>;

		for(const disposable of textures.localValues()) {

			disposable.dispose();

		}

	}

}
