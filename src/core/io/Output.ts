import { BaseEvent, EventDispatcher, RenderTargetOptions, UnsignedByteType } from "three";
import { ObservableMap } from "../../utils/ObservableMap.js";
import { BaseEventMap } from "../BaseEventMap.js";
import { Disposable } from "../Disposable.js";
import { GBufferResource } from "./GBufferResource.js";
import { RenderTargetResource } from "./RenderTargetResource.js";
import { ShaderDataResource } from "./ShaderDataResource.js";
import { TextureResource } from "./TextureResource.js";
import { ObservableReadonlyMap } from "../../utils/ObservableReadonlyMap.js";
import { MapExtensions } from "../../utils/MapExtensions.js";

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
	 * Identifies the G-Buffer in the {@link renderTargets} collection.
	 */

	static readonly GBUFFER = "GBUFFER";

	/**
	 * Output render targets.
	 */

	readonly renderTargets: Map<string, RenderTargetResource> & MapExtensions<string, RenderTargetResource>;

	/**
	 * Output render target textures.
	 *
	 * @internal
	 */

	readonly textures: ObservableReadonlyMap<string, TextureResource>;

	/**
	 * Output shader data.
	 */

	readonly shaderData: ShaderDataResource;

	/**
	 * Indicates whether the {@link defaultBuffer} should return `null` (canvas).
	 */

	renderToScreen: boolean;

	/**
	 * Constructs new output resources.
	 */

	constructor() {

		super();

		const renderTargets = new ObservableMap<string, RenderTargetResource>();
		const textures = new ObservableMap<string, TextureResource>();

		const renderTargetListener = () => {

			this.dispatchEvent({ type: "rendertargetchange" });
			this.dispatchEvent({ type: "change" });

		};

		renderTargets.addEventListener("change", renderTargetListener);

		renderTargets.addEventListener("add", (e) => {

			e.value.addEventListener("change", renderTargetListener);
			textures.set(e.key, e.value.texture);

		});

		renderTargets.addEventListener("delete", (e) => {

			e.value.removeEventListener("change", renderTargetListener);
			textures.delete(e.key);

		});

		renderTargets.addEventListener("clear", (e) => {

			for(const value of e.target.values()) {

				value.removeEventListener("change", renderTargetListener);

			}

			textures.clear();

		});

		const shaderData = new ShaderDataResource();
		shaderData.addEventListener("change", () => {

			this.dispatchEvent({ type: "shaderdatachange" });
			this.dispatchEvent({ type: "change" });

		});

		this.renderTargets = renderTargets;
		this.textures = textures;
		this.shaderData = shaderData;
		this.renderToScreen = false;

	}

	/**
	 * Alias for {@link renderTargets}.
	 */

	get buffers(): typeof this.renderTargets {

		return this.renderTargets;

	}

	/**
	 * The primary G-Buffer, or `null` if none has been set.
	 */

	get gBuffer(): GBufferResource | null {

		return (this.renderTargets.get(Output.GBUFFER) as GBufferResource | undefined) ?? null;

	}

	set gBuffer(value: GBufferResource | null) {

		if(value === null) {

			this.renderTargets.delete(Output.GBUFFER);

		} else {

			this.setBuffer(Output.GBUFFER, value);

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
	 * The default output buffer, or `undefined` if none has been set.
	 */

	get defaultBuffer(): RenderTargetResource | null | undefined {

		return this.getBuffer(Output.BUFFER_DEFAULT);

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
	 * @param value - Render target options. Defaults to a configuration without a `depthBuffer`.
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
	 * Retrieves a buffer.
	 *
	 * @param key - The key of the buffer.
	 * @return The render target resource, or `undefined` if no buffer is set.
	 */

	getBuffer(key: string): RenderTargetResource | null | undefined {

		return this.renderToScreen ? null : this.renderTargets.get(key);

	}

	/**
	 * Sets a buffer.
	 *
	 * Render target descriptors will automatically be wrapped in a new resource.
	 *
	 * @param key - The key of the buffer.
	 * @param value - A resource or render target options. Falls back to a default configuration if omitted.
	 * @return The render target resource.
	 */

	setBuffer(key: string, value: RenderTargetResource | RenderTargetOptions = {}): RenderTargetResource {

		const resource = value instanceof RenderTargetResource ? value : new RenderTargetResource(value);
		this.renderTargets.set(key, resource);
		return resource;

	}

	/**
	 * Removes a buffer.
	 *
	 * @param key - The key of the buffer.
	 * @return True if the buffer existed and has been removed, or false if not.
	 */

	removeBuffer(key: string): boolean {

		return this.renderTargets.delete(key);

	}

	dispose(): void {

		for(const disposable of this.renderTargets.values()) {

			disposable.dispose();

		}

	}

}
