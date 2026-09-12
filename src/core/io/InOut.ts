import { EventDispatcher } from "three";
import { LoadOp } from "../../enums/LoadOp.js";
import { BaseEventMap } from "../BaseEventMap.js";
import { Output } from "./Output.js";
import { RenderTargetResource } from "./RenderTargetResource.js";

/**
 * Options for a render target connection.
 *
 * @category IO
 */

export interface InOutOptions {

	/**
	 * Specifies how the contents of the render target are handled before rendering.
	 *
	 * @defaultValue "load"
	 */

	loadOp?: LoadOp;

}

/**
 * Render target resources that a pass continues writing into.
 *
 * In-out resource connections allow the current pass to continue writing into the associated render target.
 *
 * @category IO
 */

export class InOut extends EventDispatcher<BaseEventMap> {

	/**
	 * @see {@link buffers}
	 */

	private readonly _renderTargets: Map<string, RenderTargetResource>;

	/**
	 * @see {@link loadOps}
	 */

	private readonly _loadOps: Map<string, LoadOp>;

	/**
	 * Constructs new in-out resources.
	 */

	constructor() {

		super();

		this._renderTargets = new Map<string, RenderTargetResource>();
		this._loadOps = new Map();

	}

	/**
	 * Connected render targets.
	 *
	 * @internal
	 */

	get buffers(): ReadonlyMap<string, RenderTargetResource> {

		return this._renderTargets;

	}

	/**
	 * Load operations of the {@link buffers | connected render targets}.
	 *
	 * @internal
	 */

	get loadOps(): ReadonlyMap<string, LoadOp> {

		return this._loadOps;

	}

	/**
	 * Connects the default output buffer with the given buffer.
	 *
	 * @param resource - The render target resource to connect.
	 * @param options - Connection options.
	 */

	connectDefaultBuffer(resource: RenderTargetResource, options?: InOutOptions): void {

		this.connectBuffer(Output.BUFFER_DEFAULT, resource, options);

	}

	/**
	 * Connects the a specific output buffer with the given buffer.
	 *
	 * @param key - The name of the output buffer.
	 * @param resource - The render target resource to connect.
	 * @param options - Connection options.
	 */

	connectBuffer(key: string, resource: RenderTargetResource, options?: InOutOptions): void {

		this._loadOps.set(key, options?.loadOp ?? "load");
		this._renderTargets.set(key, resource);

		this.dispatchEvent({ type: "change" });

	}

	/**
	 * Disconnects the given buffer.
	 *
	 * @param key - The name of the buffer.
	 * @return Whether the buffer was disconnected.
	 */

	disconnectBuffer(key: string): boolean {

		const deleted = this._renderTargets.delete(key);

		if(deleted) {

			this._loadOps.delete(key);
			this.dispatchEvent({ type: "change" });

		}

		return deleted;

	}

	/**
	 * Disconnects all buffer resources.
	 */

	clearBuffers(): void {

		this._renderTargets.clear();
		this._loadOps.clear();

		this.dispatchEvent({ type: "change" });

	}

}
