import { EventDispatcher, Uniform, UnsignedByteType, WebGLRenderTarget } from "three";
import { ObservableMap } from "../../utils/ObservableMap.js";
import { BaseEventMap } from "../BaseEventMap.js";
import { Disposable } from "../Disposable.js";
import { ShaderData } from "../ShaderData.js";
import { RenderTargetResource } from "./RenderTargetResource.js";
import { Resource } from "./Resource.js";

/**
 * Output resources.
 *
 * Listen for events of type {@link EVENT_CHANGE} to react to resource updates.
 *
 * @category IO
 */

export class Output extends EventDispatcher<BaseEventMap> implements Disposable, ShaderData {

	/**
	 * Triggers when an output resource is added, replaced or removed.
	 *
	 * @event
	 */

	static readonly EVENT_CHANGE = "change";

	/**
	 * Identifies the default output buffer in the {@link renderTargets} collection.
	 */

	static readonly BUFFER_DEFAULT = "BUFFER_DEFAULT";

	readonly defines: Map<string, string | number | boolean>;
	readonly uniforms: Map<string, Uniform>;

	/**
	 * Output render targets.
	 */

	readonly renderTargets: Map<string, RenderTargetResource>;

	/**
	 * Constructs new output resources.
	 */

	constructor() {

		super();

		const defines = new ObservableMap<string, string | number | boolean>();
		const uniforms = new ObservableMap<string, Uniform>();
		const renderTargets = new ObservableMap<string, RenderTargetResource>();
		const listener = () => this.setChanged();

		defines.addEventListener(ObservableMap.EVENT_CHANGE, listener);
		uniforms.addEventListener(ObservableMap.EVENT_CHANGE, listener);
		renderTargets.addEventListener(ObservableMap.EVENT_CHANGE, listener);

		renderTargets.addEventListener(ObservableMap.EVENT_ADD,
			(e) => e.value.addEventListener(Resource.EVENT_CHANGE, listener));

		renderTargets.addEventListener(ObservableMap.EVENT_DELETE,
			(e) => e.value.removeEventListener(Resource.EVENT_CHANGE, listener));

		this.defines = defines;
		this.uniforms = uniforms;
		this.renderTargets = renderTargets;

	}

	/**
	 * Alias for {@link renderTargets}.
	 */

	get buffers(): Map<string, RenderTargetResource> {

		return this.renderTargets;

	}

	/**
	 * Indicates whether a default output buffer has been set.
	 */

	get hasDefaultBuffer(): boolean {

		return this.renderTargets.has(Output.BUFFER_DEFAULT);

	}

	/**
	 * The default output buffer.
	 */

	get defaultBuffer(): RenderTargetResource | null {

		return this.renderTargets.get(Output.BUFFER_DEFAULT) ?? null;

	}

	set defaultBuffer(value: RenderTargetResource | WebGLRenderTarget | null) {

		this.setBuffer(Output.BUFFER_DEFAULT, value);

	}

	/**
	 * Indicates whether the default buffer uses high precision.
	 */

	get frameBufferPrecisionHigh(): boolean {

		const outputBuffer = this.defaultBuffer?.value;

		if(outputBuffer === undefined || outputBuffer === null) {

			return false;

		}

		// Assuming index 0 is the main color attachment if this is a G-Buffer.
		return outputBuffer.texture.type !== UnsignedByteType;

	}

	/**
	 * Dispatches a `change` event.
	 *
	 * @internal
	 */

	setChanged(): void {

		this.dispatchEvent({ type: Output.EVENT_CHANGE });

	}

	/**
	 * Sets a buffer.
	 *
	 * A new resource will be created if the buffer doesn't already exist.
	 *
	 * @param key - A buffer key.
	 * @param value - The buffer.
	 */

	setBuffer(key: string, value: RenderTargetResource | WebGLRenderTarget | null): void {

		if(value instanceof RenderTargetResource) {

			this.renderTargets.set(key, value);

		} else {

			const resource = this.renderTargets.get(key);

			if(resource !== undefined && resource !== null) {

				resource.value = value;

			} else {

				this.renderTargets.set(key, new RenderTargetResource(value));

			}

		}

	}

	/**
	 * Retrieves a buffer.
	 *
	 * @param key - A buffer key.
	 * @return The buffer, or `null` if it doesn't exist.
	 */

	getBuffer(key: string): WebGLRenderTarget | null {

		return this.renderTargets.get(key)?.value ?? null;

	}

	dispose(): void {

		for(const disposable of this.renderTargets.values()) {

			disposable.value?.dispose();

		}

	}

}
