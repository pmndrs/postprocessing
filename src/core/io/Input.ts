import { EventDispatcher, IUniform, Texture, UnsignedByteType } from "three";
import { GBuffer } from "../../enums/GBuffer.js";
import { GBufferConfig } from "../../utils/gbuffer/GBufferConfig.js";
import { ObservableMap } from "../../utils/ObservableMap.js";
import { ObservableSet } from "../../utils/ObservableSet.js";
import { BaseEventMap } from "../BaseEventMap.js";
import { Disposable } from "../Disposable.js";
import { ShaderData } from "../ShaderData.js";
import { TextureResource } from "./TextureResource.js";

/**
 * Input resources.
 *
 * @category IO
 */

export class Input extends EventDispatcher<BaseEventMap> implements Disposable, ShaderData {

	/**
	 * Identifies the default input buffer in the {@link textures} collection.
	 */

	static readonly BUFFER_DEFAULT = "BUFFER_DEFAULT";

	readonly defines: Map<string, string | number | boolean>;
	readonly uniforms: Map<string, IUniform>;

	/**
	 * Required {@link GBuffer} components.
	 *
	 * {@link GBuffer.COLOR} is included by default.
	 */

	readonly gBuffer: Set<GBuffer | string>;

	/**
	 * Input textures.
	 *
	 * Entries specified in {@link gBuffer} will be added automatically.
	 */

	readonly textures: Map<GBuffer | string, TextureResource>;

	/**
	 * @see {@link gBufferConfig}.
	 */

	private _gBufferConfig: GBufferConfig | null;

	/**
	 * An event listener that triggers a `change` event.
	 */

	private readonly propagateChangeEvent: () => void;

	/**
	 * Constructs new input resources.
	 */

	constructor() {

		super();

		const gBuffer = new ObservableSet<GBuffer>([GBuffer.COLOR]);
		const defines = new ObservableMap<string, string | number | boolean>();
		const uniforms = new ObservableMap<string, IUniform>();
		const textures = new ObservableMap<GBuffer | string, TextureResource>();
		const propagateChangeEvent = () => this.setChanged();

		gBuffer.addEventListener("change", propagateChangeEvent);
		defines.addEventListener("change", propagateChangeEvent);
		uniforms.addEventListener("change", propagateChangeEvent);
		textures.addEventListener("change", propagateChangeEvent);

		textures.addEventListener("add", (e) => e.value.addEventListener("change", propagateChangeEvent));
		textures.addEventListener("delete", (e) => e.value.removeEventListener("change", propagateChangeEvent));

		textures.addEventListener("clear", (e) => {

			for(const value of e.target.values()) {

				value.removeEventListener("change", propagateChangeEvent);

			}

		});

		this.propagateChangeEvent = propagateChangeEvent;
		this.defines = defines;
		this.uniforms = uniforms;
		this.textures = textures;
		this.gBuffer = gBuffer;

		this._gBufferConfig = null;

	}

	/**
	 * The current G-Buffer configuration.
	 *
	 * @internal
	 */

	get gBufferConfig(): GBufferConfig | null {

		return this._gBufferConfig;

	}

	set gBufferConfig(value: GBufferConfig | null) {

		if(this._gBufferConfig !== null) {

			this._gBufferConfig.removeEventListener("change", this.propagateChangeEvent);

		}

		if(value !== null) {

			value.addEventListener("change", this.propagateChangeEvent);

		}

		this._gBufferConfig = value;
		this.setChanged();

	}

	/**
	 * Alias for {@link textures}.
	 */

	get buffers(): Map<GBuffer | string, TextureResource> {

		return this.textures;

	}

	/**
	 * Indicates whether a default input buffer has been set.
	 */

	get hasDefaultBuffer(): boolean {

		return this.textures.has(Input.BUFFER_DEFAULT);

	}

	/**
	 * The default input buffer.
	 */

	get defaultBuffer(): TextureResource | null {

		return this.textures.get(Input.BUFFER_DEFAULT) ?? null;

	}

	set defaultBuffer(value: TextureResource | Texture | null) {

		this.setBuffer(Input.BUFFER_DEFAULT, value);

	}

	/**
	 * Indicates whether the default buffer uses high precision.
	 */

	get frameBufferPrecisionHigh(): boolean {

		return (this.defaultBuffer?.value?.type !== UnsignedByteType);

	}

	/**
	 * Dispatches a `change` event.
	 *
	 * @internal
	 */

	setChanged(): void {

		this.dispatchEvent({ type: "change" });

	}

	/**
	 * Sets a buffer.
	 *
	 * A new resource will be created if the buffer doesn't already exist.
	 *
	 * @param key - A buffer key.
	 * @param value - The buffer.
	 */

	setBuffer(key: string, value: TextureResource | Texture | null): void {

		if(value instanceof TextureResource) {

			this.textures.set(key, value);

		} else {

			const resource = this.textures.get(key);

			if(resource !== undefined && resource !== null) {

				resource.value = value;

			} else {

				this.textures.set(key, new TextureResource(value));

			}

		}

	}

	/**
	 * Retrieves a buffer.
	 *
	 * @param key - A buffer key.
	 * @return The buffer, or `null` if it doesn't exist.
	 */

	getBuffer(key: string): Texture | null {

		return this.textures.get(key)?.value ?? null;

	}

	/**
	 * Removes the default buffer.
	 *
	 * @return True if the buffer existed and has been removed, or false if it doesn't exist.
	 */

	removeDefaultBuffer(): boolean {

		return this.textures.delete(Input.BUFFER_DEFAULT);

	}

	dispose(): void {

		for(const disposable of this.textures.values()) {

			disposable.value?.dispose();

		}

	}

}
