import { EventDispatcher, Uniform, UnsignedByteType, WebGLMultipleRenderTargets, WebGLRenderTarget } from "three";
import { ObservableMap } from "../utils/ObservableMap.js";
import { BaseEventMap } from "./BaseEventMap.js";
import { ShaderData } from "./ShaderData.js";

/**
 * Output resources.
 *
 * Listen for events of type {@link EVENT_CHANGE} to react to resource updates.
 *
 * @category Core
 */

export class Output extends EventDispatcher<BaseEventMap> implements ShaderData {

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

	readonly renderTargets: Map<string, WebGLRenderTarget | WebGLMultipleRenderTargets | null>;

	/**
	 * Constructs new output resources.
	 */

	constructor() {

		super();

		const defines = new ObservableMap<string, string | number | boolean>();
		const uniforms = new ObservableMap<string, Uniform>();
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

	get buffers(): Map<string, WebGLRenderTarget | WebGLMultipleRenderTargets | null> {

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

	/**
	 * Indicates whether the default buffer uses high precision.
	 */

	get frameBufferPrecisionHigh(): boolean {

		const outputBuffer = this.defaultBuffer;

		if(outputBuffer === null) {

			return false;

		}

		// Assuming index 0 is the albedo attachment.
		const type = outputBuffer instanceof WebGLMultipleRenderTargets ?
			outputBuffer.texture[0].type :
			outputBuffer.texture.type;

		return type !== UnsignedByteType;

	}

}
