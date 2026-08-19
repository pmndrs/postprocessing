import { RenderTask } from "../RenderTask.js";
import { RenderTargetResource } from "./RenderTargetResource.js";

/**
 * RenderTargetVersion constructor options.
 *
 * @internal
 */

export interface RenderTargetVersionOptions {

	/**
	 * The descriptor, resolution, attachment schema, etc.
	 */

	readonly resource: RenderTargetResource;

	/**
	 * The task that writes to this version.
	 */

	readonly writer: RenderTask;

	/**
	 * An index used for sorting.
	 */

	readonly index: number;

}

/**
 * A version of a `RenderTargetResource` at a specific point in a `FrameGraph`.
 */

export class RenderTargetVersion implements RenderTargetVersionOptions {

	readonly resource: RenderTargetResource;
	readonly writer: RenderTask;
	readonly index: number;

	/**
	 * Constructs a new render target version.
	 *
	 * @options - The options.
	 */

	constructor({ resource, writer, index }: RenderTargetVersionOptions) {

		this.resource = resource;
		this.writer = writer;
		this.index = index;

	}

}
