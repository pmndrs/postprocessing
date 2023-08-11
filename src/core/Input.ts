import { Texture, Uniform, UnsignedByteType } from "three";
import { GBuffer } from "../enums/GBuffer.js";
import { BufferedEventDispatcher } from "../utils/BufferedEventDispatcher.js";
import { ObservableMap } from "../utils/ObservableMap.js";

/**
 * Input resources.
 *
 * Listen for events of type {@link EVENT_CHANGE} to react to resource updates.
 *
 * @see BufferManager
 * @group Core
 */

export class Input extends BufferedEventDispatcher {

	/**
	 * Triggers when an input resource is added, replaced or removed.
	 *
	 * @event
	 */

	static readonly EVENT_CHANGE: string = "change";

	/**
	 * Identifies the default input buffer in the {@link textures} collection.
	 */

	static readonly BUFFER_DEFAULT: string = "buffer.default";

	/**
	 * Input uniforms.
	 */

	readonly uniforms: Map<string, Uniform>;

	/**
	 * Input textures.
	 *
	 * Entries with {@link GBuffer} keys will be populated automatically.
	 *
	 * @see EVENT_CHANGE
	 */

	readonly textures: Map<string | GBuffer, Texture | null>;

	/**
	 * Constructs new input resources.
	 */

	constructor() {

		super();

		const uniforms = new ObservableMap<string, Uniform>();
		const textures = new ObservableMap<string | GBuffer, Texture | null>();
		uniforms.addEventListener("change", (e) => this.dispatchEvent(e));
		textures.addEventListener("change", (e) => this.dispatchEvent(e));

		this.uniforms = uniforms;
		this.textures = textures;

	}

	/**
	 * Alias for {@link textures}.
	 */

	get buffers(): Map<string, Texture | null> {

		return this.textures;

	}

	/**
	 * The default input buffer.
	 */

	get defaultBuffer(): Texture | null {

		return this.textures.get(Input.BUFFER_DEFAULT) as Texture;

	}

	set defaultBuffer(value: Texture | null) {

		this.textures.set(Input.BUFFER_DEFAULT, value);

	}

	/**
	 * Indicates whether the default buffer uses high precision.
	 */

	get frameBufferPrecisionHigh(): boolean {

		return (this.defaultBuffer?.type !== UnsignedByteType);

	}

}
