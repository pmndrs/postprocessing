import { EventDispatcher, IUniform, UnsignedByteType, WebGLRenderTarget } from "three";
import { ObservableMap } from "../../utils/ObservableMap.js";
import { BaseEventMap } from "../BaseEventMap.js";
import { Disposable } from "../Disposable.js";
import { ShaderData } from "../ShaderData.js";
import { RenderTargetResource } from "./RenderTargetResource.js";

/**
 * Output resources.
 *
 * @category IO
 */

export class Output extends EventDispatcher<BaseEventMap> implements Disposable, ShaderData {

	/**
	 * Identifies the default output buffer in the {@link renderTargets} collection.
	 */

	static readonly BUFFER_DEFAULT = "BUFFER_DEFAULT";

	readonly defines: Map<string, string | number | boolean>;
	readonly uniforms: Map<string, IUniform>;

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
		const uniforms = new ObservableMap<string, IUniform>();
		const renderTargets = new ObservableMap<string, RenderTargetResource>();
		const propagateChangeEvent = () => this.setChanged();

		defines.addEventListener("change", propagateChangeEvent);
		uniforms.addEventListener("change", propagateChangeEvent);
		renderTargets.addEventListener("change", propagateChangeEvent);

		renderTargets.addEventListener("add", (e) => e.value.addEventListener("change", propagateChangeEvent));
		renderTargets.addEventListener("delete", (e) => e.value.removeEventListener("change", propagateChangeEvent));

		renderTargets.addEventListener("clear", (e) => {

			for(const value of e.target.values()) {

				value.removeEventListener("change", propagateChangeEvent);

			}

		});

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
	 *
	 * Setting the default buffer to `undefined` is the same as calling {@link removeDefaultBuffer}.
	 */

	get defaultBuffer(): RenderTargetResource | undefined {

		return this.renderTargets.get(Output.BUFFER_DEFAULT);

	}

	set defaultBuffer(value: RenderTargetResource | WebGLRenderTarget | null | undefined) {

		if(value === undefined) {

			this.removeDefaultBuffer();

		} else {

			this.setBuffer(Output.BUFFER_DEFAULT, value);

		}

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
	 * Unlike input buffers, output buffers can be `undefined` because `null` represents the canvas.
	 *
	 * @param key - A buffer key.
	 * @return The buffer, or `undefined` if it doesn't exist.
	 */

	getBuffer(key: string): WebGLRenderTarget | null | undefined {

		return this.renderTargets.get(key)?.value;

	}

	/**
	 * Removes the default buffer.
	 *
	 * @return True if the buffer existed and has been removed, or false if it doesn't exist.
	 */

	removeDefaultBuffer(): boolean {

		return this.renderTargets.delete(Output.BUFFER_DEFAULT);

	}

	dispose(): void {

		for(const disposable of this.renderTargets.values()) {

			disposable.value?.dispose();

		}

	}

}
