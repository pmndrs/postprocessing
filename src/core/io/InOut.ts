import { EventDispatcher } from "three";
import { LoadOp } from "../../enums/LoadOp.js";
import { BaseEventMap } from "../BaseEventMap.js";
import { Output } from "./Output.js";
import { RenderTargetResource } from "./RenderTargetResource.js";
import { InOutConnection } from "./InOutConnection.js";

/**
 * Options for a render target connection.
 *
 * @category IO
 */

export interface InOutOptions {

	/**
	 * Specifies how the existing contents of the render target resource are handled when it's used.
	 *
	 * @defaultValue "load"
	 */

	loadOp?: LoadOp;

}

/**
 * Connects a pass to render target resources produced by other passes.
 *
 * An in-out connection allows the pass to continue rendering into an existing render target without creating a copy.
 *
 * @category IO
 */

export class InOut extends EventDispatcher<BaseEventMap> {

	/**
	 * @see {@link connections}
	 */

	private readonly _connections: Map<string, InOutConnection>;

	/**
	 * Constructs new in-out resources.
	 */

	constructor() {

		super();
		this._connections = new Map();

	}

	/**
	 * Connected render target resources.
	 *
	 * @internal
	 */

	get connections(): ReadonlyMap<string, InOutConnection> {

		return this._connections;

	}

	/**
	 * Connects the pass's default output buffer to the given render target resource.
	 *
	 * @param resource - The render target resource to connect.
	 * @param options - Connection options.
	 */

	connectDefault(resource: RenderTargetResource, options?: InOutOptions): void {

		this.connect(Output.BUFFER_DEFAULT, resource, options);

	}

	/**
	 * Connects the pass to the render target resource associated with the given key.
	 *
	 * @param key - The name of the output buffer.
	 * @param resource - The render target resource to connect.
	 * @param options - Connection options.
	 */

	connect(key: string, resource: RenderTargetResource, options?: InOutOptions): void {

		this._connections.set(key, { resource, loadOp: options?.loadOp ?? "load" });
		this.dispatchEvent({ type: "change" });

	}

	/**
	 * Disconnects the pass from the render target resource associated with the given key.
	 *
	 * @param key - The name of the output buffer.
	 * @return Whether the buffer was disconnected.
	 */

	disconnect(key: string): boolean {

		if(this._connections.delete(key)) {

			this.dispatchEvent({ type: "change" });
			return true;

		}

		return false;

	}

	/**
	 * Disconnects all render target resources.
	 */

	clear(): void {

		if(this._connections.size === 0) {

			return;

		}

		this._connections.clear();
		this.dispatchEvent({ type: "change" });

	}

}
