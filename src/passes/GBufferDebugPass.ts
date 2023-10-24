import { GBuffer } from "../enums/GBuffer.js";
import { CopyPass } from "./CopyPass.js";

/**
 * A depth picking pass.
 *
 * @group Passes
 */

export class GBufferDebugPass extends CopyPass {

	/**
	 * Constructs a new GBuffer debug pass.
	 *
	 * @param gBufferComponents - The GBuffer components to visualize.
	 */

	constructor(gBufferComponents: Set<GBuffer>) {

		super();

		this.name = "GBufferDebugPass";

	}

	override render(): void {

		super.render();

	}

}
