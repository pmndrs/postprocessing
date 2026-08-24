import { RenderTargetResource } from "./RenderTargetResource.js";

/**
 * A history resource for buffer feedback use cases.
 *
 * This resource manages two render target resources that will be swapped automatically at the end of a frame.
 *
 * @todo Refactor into an actual RenderTargetResource that has an additional `previousValue` instead of just managing two individual RenderTargetResources.
 */

export class HistoryResource {

	/**
	 * @see {@link previousBuffer}
	 */

	private _previousBuffer: RenderTargetResource;

	/**
	 * @see {@link currentBuffer}
	 */

	private _currentBuffer: RenderTargetResource;

	/**
	 * Constructs a new history resource.
	 */

	constructor() {

		this._previousBuffer = new RenderTargetResource();
		this._previousBuffer.persistent = true;

		this._currentBuffer = new RenderTargetResource();
		this._currentBuffer.persistent = true;

	}

	/**
	 * The previous render target.
	 *
	 * This buffer contains the image of the previous render operation.
	 */

	get previousBuffer(): RenderTargetResource {

		return this._previousBuffer;

	}

	/**
	 * The current render target.
	 *
	 * This buffer serves as a target for the current render operation.
	 */

	get currentBuffer(): RenderTargetResource {

		return this._currentBuffer;

	}

	/**
	 * Swaps the render targets.
	 *
	 * Will be called by the frame graph after each frame.
	 *
	 * @internal
	 */

	swap(): void {

		const buffer = this._previousBuffer;
		this._previousBuffer = this._currentBuffer;
		this._currentBuffer = buffer;

	}

}
