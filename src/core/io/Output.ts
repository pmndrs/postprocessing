import { BaseEvent, EventDispatcher, RenderTargetOptions, UnsignedByteType } from "three";
import { MapExtensions } from "../../utils/MapExtensions.js";
import { ObservableMap } from "../../utils/ObservableMap.js";
import { BaseEventMap } from "../BaseEventMap.js";
import { Disposable } from "../Disposable.js";
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

export class Output extends EventDispatcher<OutputEventMap> implements Disposable {

	/**
	 * Identifies the default output buffer in the {@link renderTargets} collection.
	 */

	static readonly BUFFER_DEFAULT = "BUFFER_DEFAULT";

	/**
	 * Output render targets, organized by name.
	 */

	readonly renderTargets: Map<string, RenderTargetResource> & MapExtensions<string, RenderTargetResource>;

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
	 * Alias for {@link renderTargets}.
	 */

	get buffers(): typeof this.renderTargets {

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
	 * The default output buffer, or `undefined` if none has been set.
	 */

	get defaultBuffer(): RenderTargetResource | undefined {

		return this.renderTargets.get(Output.BUFFER_DEFAULT);

	}

	set defaultBuffer(value: RenderTargetResource | RenderTargetOptions | undefined) {

		if(value === undefined) {

			this.removeDefaultBuffer();

		} else {

			this.setBuffer(Output.BUFFER_DEFAULT, value);

		}

	}

	/**
	 * Creates a new default buffer.
	 *
	 *
	 * @param options - Render target options. Defaults to a configuration without a `depthBuffer`.
	 * @return The render target resource.
	 */

	createDefaultBuffer(options?: RenderTargetOptions): RenderTargetResource {

		return this.setBuffer(Output.BUFFER_DEFAULT, options);

	}

	/**
	 * Removes the default buffer.
	 *
	 * @return True if the buffer existed and has been removed, or false if there is none.
	 */

	removeDefaultBuffer(): boolean {

		return this.renderTargets.delete(Output.BUFFER_DEFAULT);

	}

	/**
	 * Defines a render target resource.
	 *
	 * - Falls back to a default render target descriptor that is suitable for fullscreen passes if none is provided.
	 * - Raw render target descriptors will automatically be wrapped in a new resource.
	 *
	 * @param key - The key of the buffer.
	 * @param value - A resource or render target options.
	 * @return The render target resource.
	 */

	setBuffer(key: string, value?: RenderTargetResource | RenderTargetOptions): RenderTargetResource {

		const resource = (value instanceof RenderTargetResource) ? value : new RenderTargetResource(value);
		this.renderTargets.set(key, resource);
		return resource;

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

	dispose(): void {

		for(const disposable of this.renderTargets.values()) {

			disposable.dispose();

		}

	}

}
