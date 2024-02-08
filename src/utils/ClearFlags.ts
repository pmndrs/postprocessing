import { GBuffer } from "../enums/GBuffer.js";

/**
 * A collection of clear flags.
 *
 * @category Utils
 */

export class ClearFlags {

	/**
	 * A collection of {@link GBuffer} components that should be cleared.
	 */

	gBuffer: Set<GBuffer | string>;

	/**
	 * Indicates whether the depth buffer should be cleared.
	 */

	depth: boolean;

	/**
	 * Indicates whether the stencil buffer should be cleared.
	 */

	stencil: boolean;

	/**
	 * Constructs new clear flags.
	 *
	 * @param color - The color clear flag.
	 * @param depth - The depth clear flag.
	 * @param stencil - The stencil clear flag.
	 */

	constructor(color = true, depth = true, stencil = true) {

		const gBuffer = new Set<GBuffer>();
		gBuffer.add(GBuffer.NORMAL);
		gBuffer.add(GBuffer.ORM);
		gBuffer.add(GBuffer.EMISSION);
		this.gBuffer = gBuffer;

		this.color = color;
		this.depth = depth;
		this.stencil = stencil;


	}

	/**
	 * Indicates whether the color buffer should be cleared.
	 *
	 * Alias for the {@link gBufferComponents} entry {@link GBuffer.COLOR}.
	 */

	get color(): boolean {

		return this.gBuffer.has(GBuffer.COLOR);

	}

	set color(value: boolean) {

		if(value) {

			this.gBuffer.add(GBuffer.COLOR);

		} else {

			this.gBuffer.delete(GBuffer.COLOR);

		}

	}

}
