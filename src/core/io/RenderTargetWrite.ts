import { LoadOp } from "../../enums/LoadOp.js";
import { ClearFlags } from "../../utils/ClearFlags.js";
import { RenderTargetResource } from "./RenderTargetResource.js";

/**
 * Render target write declaration.
 */

export interface RenderTargetWrite {

	/**
	 * The resource that this declaration applies to.
	 */

	readonly target: RenderTargetResource;

	/**
	 * The pixel load operation to use.
	 */

	readonly loadOp: LoadOp;

	/**
	 * Optional clear flags that indicate which attachments will actually be cleared.
	 *
	 * Only relevant if {@link loadOp} is set to `clear`. If omitted, all attachments will be assumed to be affected.
	 */

	readonly clearFlags?: ClearFlags;

}
