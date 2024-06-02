import { EventDispatcher, Texture, Uniform, UnsignedByteType } from "three";
import { GBuffer } from "../../enums/GBuffer.js";
import { GBufferConfig } from "../../utils/GBufferConfig.js";
import { ObservableMap } from "../../utils/ObservableMap.js";
import { ObservableSet } from "../../utils/ObservableSet.js";
import { BaseEventMap } from "../BaseEventMap.js";
import { ShaderData } from "../ShaderData.js";
import { Resource } from "./Resource.js";
import { TextureResource } from "./TextureResource.js";

/**
 * Input resources.
 *
 * Listen for events of type {@link EVENT_CHANGE} to react to resource updates.
 *
 * @category IO
 */

export class Input extends EventDispatcher<BaseEventMap> implements ShaderData {

	/**
	 * Triggers when an input resource is added, replaced or removed.
	 *
	 * This event is also fired when gBuffer components are changed. The actual gBuffer textures can be accessed through
	 * the {@link textures} map by using {@link GBuffer} values as keys.
	 *
	 * @event
	 */

	static readonly EVENT_CHANGE = "change";

	/**
	 * Identifies the default input buffer in the {@link textures} collection.
	 */

	static readonly BUFFER_DEFAULT = "BUFFER_DEFAULT";

	readonly defines: Map<string, string | number | boolean>;
	readonly uniforms: Map<string, Uniform>;

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
	 *
	 * @see {@link EVENT_CHANGE}
	 */

	readonly textures: Map<GBuffer | string, TextureResource>;

	/**
	 * @see {@link gBufferConfig}.
	 */

	private _gBufferConfig: GBufferConfig | null;

	/**
	 * An event listener that triggers an {@link EVENT_CHANGE} event.
	 */

	private readonly listener: () => void;

	/**
	 * Constructs new input resources.
	 */

	constructor() {

		super();

		const gBuffer = new ObservableSet<GBuffer>([GBuffer.COLOR]);
		const defines = new ObservableMap<string, string | number | boolean>();
		const uniforms = new ObservableMap<string, Uniform>();
		const textures = new ObservableMap<GBuffer | string, TextureResource>();

		const listener = () => this.dispatchEvent({ type: Input.EVENT_CHANGE });
		gBuffer.addEventListener(ObservableSet.EVENT_CHANGE, listener);
		defines.addEventListener(ObservableMap.EVENT_CHANGE, listener);
		uniforms.addEventListener(ObservableMap.EVENT_CHANGE, listener);
		textures.addEventListener(ObservableMap.EVENT_CHANGE, listener);

		textures.addEventListener(ObservableMap.EVENT_ADD,
			(e) => e.value.addEventListener(Resource.EVENT_CHANGE, listener));

		textures.addEventListener(ObservableMap.EVENT_DELETE,
			(e) => e.value.removeEventListener(Resource.EVENT_CHANGE, listener));

		this.listener = listener;
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

			this._gBufferConfig.removeEventListener(GBufferConfig.EVENT_CHANGE, this.listener);

		}

		if(value !== null) {

			value.addEventListener(GBufferConfig.EVENT_CHANGE, this.listener);

		}

		this._gBufferConfig = value;
		this.dispatchEvent({ type: Input.EVENT_CHANGE });

	}

	/**
	 * Alias for {@link textures}.
	 */

	get buffers(): Map<GBuffer | string, TextureResource> {

		return this.textures;

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
	 * Sets a buffer.
	 *
	 * A new resource will be created if the buffer doesn't already exist.
	 *
	 * @param key - A buffer key.
	 * @param value - The buffer.
	 */

	setBuffer(key: string, value: TextureResource | Texture | null): void {

		if(value instanceof TextureResource) {

			if(this.textures.get(key) !== value) {

				this.textures.set(key, value);

			}

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

}
