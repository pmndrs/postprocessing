import { EventDispatcher, Texture, Uniform, UnsignedByteType } from "three";
import { GBuffer } from "../../enums/GBuffer.js";
import { ObservableMap } from "../../utils/ObservableMap.js";
import { ObservableSet } from "../../utils/ObservableSet.js";
import { BaseEventMap } from "../BaseEventMap.js";
import { ShaderData } from "../ShaderData.js";
import { Resource } from "./Resource.js";
import { TextureResource } from "./TextureResource.js";
import { GBufferConfig } from "../../utils/GBufferConfig.js";

/**
 * Input resources.
 *
 * Listen for events of type {@link EVENT_CHANGE} to react to resource updates.
 *
 * @category Core
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

		if(value instanceof TextureResource) {

			if(this.textures.get(Input.BUFFER_DEFAULT) !== value) {

				this.textures.set(Input.BUFFER_DEFAULT, value);

			}

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
