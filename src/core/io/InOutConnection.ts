import { LoadOp } from "../../enums/LoadOp.js";
import { RenderTargetResource } from "./RenderTargetResource.js";

/**
 * An in-out render target connection.
 *
 * @internal
 */

export interface InOutConnection {

	/**
	 * The connected resource.
	 */

	readonly resource: RenderTargetResource;

	/**
	 * The load operation of the connected resource.
	 *
	 * @defaultValue "load"
	 */

	readonly loadOp: LoadOp;

}
