/**
 * A collection of clear flags.
 *
 * @group Utils
 */

import { GBuffer } from "../enums/GBuffer.js";

export class ClearFlags {

	/**
	 * Indicates whether the color buffer should be cleared.
	 */

	color: boolean;

	/**
	 * Indicates whether the depth buffer should be cleared.
	 */

	depth: boolean;

	/**
	 * Indicates whether the stencil buffer should be cleared.
	 */

	stencil: boolean;

	/**
	 * A collection of GBuffer components that should be cleared.
	 */

	readonly gBuffer: Set<GBuffer>;

	/**
	 * Constructs new clear flags.
	 */

	constructor() {

		this.color = true;
		this.depth = true;
		this.stencil = true;
		this.gBuffer = new Set<GBuffer>();

	}

}
