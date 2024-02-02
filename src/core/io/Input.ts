import { EventDispatcher, Texture, Uniform, UnsignedByteType } from "three";
import { GBuffer } from "../../enums/GBuffer.js";
import { MapEvent, ObservableMap } from "../../utils/ObservableMap.js";
import { ObservableSet } from "../../utils/ObservableSet.js";
import { BaseEventMap } from "../BaseEventMap.js";
import { ShaderData } from "../ShaderData.js";
import { Resource } from "./Resource.js";
import { TextureResource } from "./TextureResource.js";

/**
 * Input events.
 *
 * @category IO
 */

export interface InputEventMap extends BaseEventMap {

	add: MapEvent<string, Resource>;
	delete: MapEvent<string, Resource>;

}

/**
 * Input resources.
 *
 * Listen for events of type {@link EVENT_CHANGE} to react to resource updates.
 *
 * @category Core
 */

export class Input extends EventDispatcher<InputEventMap> implements ShaderData {

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
	 * Triggers when a new input resource is added.
	 *
	 * @event
	 */

	static readonly EVENT_ADD = "add";

	/**
	 * Triggers when an input resource is removed or overwritten.
	 *
	 * @event
	 */

	static readonly EVENT_DELETE = "delete";

	/**
	 * Identifies the default input buffer in the {@link textures} collection.
	 */

	static readonly BUFFER_DEFAULT = "BUFFER_DEFAULT";

	readonly defines: Map<string, string | number | boolean>;
	readonly uniforms: Map<string, Uniform>;

	/**
	 * Required gBuffer components.
	 *
	 * {@link GBuffer.COLOR} is included by default.
	 */

	readonly gBuffer: Set<GBuffer>;

	/**
	 * Input textures.
	 *
	 * Entries specified in {@link gBuffer} will be added automatically.
	 *
	 * @see {@link EVENT_CHANGE}
	 */

	readonly textures: Map<string | GBuffer, TextureResource>;

	/**
	 * Constructs new input resources.
	 */

	constructor() {

		super();

		const defines = new ObservableMap<string, string | number | boolean>();
		const uniforms = new ObservableMap<string, Uniform>();
		const textures = new ObservableMap<string | GBuffer, TextureResource>();
		const gBuffer = new ObservableSet<GBuffer>([GBuffer.COLOR]);

		uniforms.addEventListener(ObservableMap.EVENT_CHANGE, (e) => this.dispatchEvent(e));
		textures.addEventListener(ObservableMap.EVENT_ADD, (e) => this.dispatchEvent(e));
		textures.addEventListener(ObservableMap.EVENT_DELETE, (e) => this.dispatchEvent(e));
		textures.addEventListener(ObservableMap.EVENT_CHANGE, (e) => this.dispatchEvent(e));
		gBuffer.addEventListener(ObservableSet.EVENT_CHANGE, (e) => this.dispatchEvent(e));

		this.defines = defines;
		this.uniforms = uniforms;
		this.textures = textures;
		this.gBuffer = gBuffer;

	}

	/**
	 * Alias for {@link textures}.
	 */

	get buffers(): Map<string | GBuffer, TextureResource> {

		return this.textures;

	}

	/**
	 * The default input buffer.
	 */

	get defaultBuffer(): TextureResource | null {

		return this.textures.get(Input.BUFFER_DEFAULT) ?? null;

	}

	set defaultBuffer(value: TextureResource | Texture | null) {

		if(value instanceof TextureResource) {

			this.textures.set(Input.BUFFER_DEFAULT, value);

		} else {

			const resource = this.defaultBuffer;

			if(resource !== null) {

				resource.value = value;

			} else {

				this.textures.set(Input.BUFFER_DEFAULT, new TextureResource(value));

			}

		}

	}

	/**
	 * Indicates whether the default buffer uses high precision.
	 */

	get frameBufferPrecisionHigh(): boolean {

		return (this.defaultBuffer?.value?.type !== UnsignedByteType);

	}

}
