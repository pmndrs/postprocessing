import { BaseEvent, Uniform, WebGLRenderTarget } from "three";
import { GBuffer } from "../enums/GBuffer.js";
import { BufferedEventDispatcher } from "../utils/BufferedEventDispatcher.js";
import { ObservableMap } from "../utils/ObservableMap.js";

/**
 * Output events.
 */

export interface OutputEventMap {

	change: BaseEvent;

}

/**
 * Output resources.
 *
 * Listen for events of type {@link EVENT_CHANGE} to react to resource updates.
 *
 * @see BufferManager
 * @group Core
 */

export class Output extends BufferedEventDispatcher<OutputEventMap> {

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
	 * Output uniforms.
	 */

	readonly uniforms: Map<string, Uniform>;

	/**
	 * Output render targets.
	 */

	readonly renderTargets: Map<string | GBuffer, WebGLRenderTarget | null>;

	/**
	 * Constructs new output resources.
	 */

	constructor() {

		super();

		const uniforms = new ObservableMap<string, Uniform>();
		const renderTargets = new ObservableMap<string | GBuffer, WebGLRenderTarget | null>();
		uniforms.addEventListener(ObservableMap.EVENT_CHANGE, (e) => this.dispatchEvent(e));
		renderTargets.addEventListener(ObservableMap.EVENT_CHANGE, (e) => this.dispatchEvent(e));

		this.uniforms = uniforms;
		this.renderTargets = renderTargets;

	}

	/**
	 * Alias for {@link renderTargets}.
	 */

	get buffers(): Map<string | GBuffer, WebGLRenderTarget | null> {

		return this.renderTargets;

	}

	/**
	 * The default output buffer.
	 */

	get defaultBuffer(): WebGLRenderTarget | null {

		return this.renderTargets.get(Output.BUFFER_DEFAULT) as WebGLRenderTarget;

	}

	set defaultBuffer(value: WebGLRenderTarget | null) {

		this.renderTargets.set(Output.BUFFER_DEFAULT, value);

	}

}
