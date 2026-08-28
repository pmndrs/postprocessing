import { BaseEvent, EventDispatcher, RenderTargetOptions, UnsignedByteType } from "three";
import { ObservableMap } from "../../utils/ObservableMap.js";
import { BaseEventMap } from "../BaseEventMap.js";
import { RenderTargetResource } from "./RenderTargetResource.js";
import { ShaderDataResource } from "./ShaderDataResource.js";
import { TextureResource } from "./TextureResource.js";

/**
 * Output events.
 *
 * @category IO
 */

export interface OutputEventMap extends BaseEventMap {

	/**
	 * Triggers when the output render targets have changed.
	 *
	 * @event
	 */

	rendertargetchange: BaseEvent<"rendertargetchange">;

	/**
	 * Triggers when the output shader data has changed.
	 *
	 * @event
	 */

	shaderdatachange: BaseEvent<"shaderdatachange">;

}

/**
 * Output resources.
 *
 * @category IO
 */

export class Output extends EventDispatcher<OutputEventMap> {

	/**
	 * Identifies the default output buffer in the {@link renderTargets} collection.
	 */

	static readonly BUFFER_DEFAULT = "BUFFER_DEFAULT";

	/**
	 * @see {@link buffers}
	 */

	private readonly renderTargets: ObservableMap<string, RenderTargetResource>;

	/**
	 * Output shader data.
	 */

	readonly shaderData: ShaderDataResource;

	/**
	 * Constructs new output resources.
	 */

	constructor() {

		super();

		const renderTargets = new ObservableMap<string, RenderTargetResource>();
		const renderTargetListener = () => {

			this.dispatchEvent({ type: "rendertargetchange" });
			this.dispatchEvent({ type: "change" });

		};

		renderTargets.addEventListener("change", renderTargetListener);
		renderTargets.addEventListener("add", (e) => e.value.addEventListener("change", renderTargetListener));
		renderTargets.addEventListener("delete", (e) => e.value.removeEventListener("change", renderTargetListener));
		renderTargets.addEventListener("clear", (e) => {

			for(const value of e.target.values()) {

				value.removeEventListener("change", renderTargetListener);

			}

		});

		const shaderData = new ShaderDataResource();
		shaderData.addEventListener("change", () => {

			this.dispatchEvent({ type: "shaderdatachange" });
			this.dispatchEvent({ type: "change" });

		});

		this.renderTargets = renderTargets;
		this.shaderData = shaderData;

	}

	/**
	 * Output render targets, organized by name.
	 */

	get buffers(): ReadonlyMap<string, RenderTargetResource> {

		return this.renderTargets;

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
	 * The default output buffer, or `undefined` if there is none.
	 */

	get defaultBuffer(): RenderTargetResource | undefined {

		return this.renderTargets.get(Output.BUFFER_DEFAULT);

	}

	/**
	 * Returns all texture resources of the current render target resources.
	 *
	 * @return An iterator over the render target textures.
	 */

	*textures(): IterableIterator<[string, TextureResource]> {

		for(const [name, renderTarget] of this.renderTargets) {

			yield [name, renderTarget.texture];
			yield* renderTarget.textures;

		}

	}

	// #region Internal

	/**
	 * Sets the default buffer.
	 *
	 * @internal
	 * @throws If the given resource belongs to another output.
	 * @param value - A render target resource or its options. Defaults to a configuration suited for fullscreen passes.
	 * @return The render target resource.
	 */

	setDefaultBuffer(value?: RenderTargetResource | RenderTargetOptions): RenderTargetResource {

		return this.setBuffer(Output.BUFFER_DEFAULT, value);

	}

	/**
	 * Removes the default buffer.
	 *
	 * @internal
	 * @return Whether the default buffer was removed.
	 */

	deleteDefaultBuffer(): boolean {

		return this.deleteBuffer(Output.BUFFER_DEFAULT);

	}

	/**
	 * Defines a render target resource.
	 *
	 * - Falls back to a default render target descriptor that is suitable for fullscreen passes if none is provided.
	 * - Raw render target descriptors will automatically be wrapped in a new resource.
	 *
	 * @internal
	 * @throws If the given resource belongs to another output.
	 * @param key - The key of the buffer.
	 * @param value - A render target resource or its options.
	 * @return The render target resource.
	 */

	setBuffer(key: string, value?: RenderTargetResource | RenderTargetOptions): RenderTargetResource {

		const resource = (value instanceof RenderTargetResource) ? value : new RenderTargetResource(value);

		if(resource.owner === null) {

			resource.owner = this;
			this.renderTargets.set(key, resource);

		} else if(resource.owner !== this) {

			throw new Error(`The given resource for the key "${key}" is already owned by another output`);

		}

		return resource;

	}

	/**
	 * Removes the specified buffer.
	 *
	 * @internal
	 * @param key - The key of the buffer.
	 * @return Whether the buffer was removed.
	 */

	deleteBuffer(key: string): boolean {

		if(this.renderTargets.has(key)) {

			this.renderTargets.get(key)!.owner = null;

		}

		return this.renderTargets.delete(key);

	}

	/**
	 * Removes all output buffers.
	 *
	 * @internal
	 */

	clearBuffers(): void {

		for(const resource of this.renderTargets.values()) {

			resource.owner = null;

		}

		this.renderTargets.clear();

	}

	// #endregion

}
