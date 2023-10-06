import { Uniform, WebGLMultipleRenderTargets, WebGLRenderTarget } from "three";
import { BufferedEventDispatcher } from "../utils/BufferedEventDispatcher.js";
import { ObservableMap } from "../utils/ObservableMap.js";
import { BaseEventMap } from "./BaseEventMap.js";

/**
 * Output resources.
 *
 * Listen for events of type {@link EVENT_CHANGE} to react to resource updates.
 *
 * @see BufferManager
 * @group Core
 */

export class Output extends BufferedEventDispatcher<BaseEventMap> {

	/**
	 * Triggers when an output resource is added, replaced or removed.
	 *
	 * @event
	 */

	static readonly EVENT_CHANGE = "change";

	/**
	 * Identifies the default output buffer in the {@link renderTargets} collection.
	 */

	static readonly BUFFER_DEFAULT = "buffer.default";

	/**
	 * Output macro definitions.
	 */

	readonly defines: Map<string, string | number | boolean>;

	/**
	 * Output uniforms.
	 */

	readonly uniforms: Map<string, Uniform>;

	/**
	 * Output render targets.
	 */

	readonly renderTargets: Map<string, WebGLRenderTarget | WebGLMultipleRenderTargets | null | undefined>;

	/**
	 * Constructs new output resources.
	 */

	constructor() {

		super();

		const uniforms = new ObservableMap<string, Uniform>();
		const defines = new ObservableMap<string, string | number | boolean>();
		const renderTargets = new ObservableMap<string, WebGLRenderTarget | WebGLMultipleRenderTargets | null>();

		defines.addEventListener(ObservableMap.EVENT_CHANGE, (e) => this.dispatchEvent(e));
		uniforms.addEventListener(ObservableMap.EVENT_CHANGE, (e) => this.dispatchEvent(e));
		renderTargets.addEventListener(ObservableMap.EVENT_CHANGE, (e) => this.dispatchEvent(e));

		this.defines = defines;
		this.uniforms = uniforms;
		this.renderTargets = renderTargets;

	}

	/**
	 * Alias for {@link renderTargets}.
	 */

	get buffers(): Map<string, WebGLRenderTarget | WebGLMultipleRenderTargets | null | undefined> {

		return this.renderTargets;

	}

	/**
	 * The default output buffer.
	 */

	get defaultBuffer(): WebGLRenderTarget | WebGLMultipleRenderTargets | null {

		return this.renderTargets.get(Output.BUFFER_DEFAULT) || null;

	}

	set defaultBuffer(value: WebGLRenderTarget | WebGLMultipleRenderTargets | null) {

		this.renderTargets.set(Output.BUFFER_DEFAULT, value);

	}

}
