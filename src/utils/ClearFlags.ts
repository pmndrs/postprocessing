import { GBuffer } from "../enums/GBuffer.js";

/**
 * A collection of clear flags.
 *
 * @category Utils
 */

export class ClearFlags {

	/**
	 * A collection of GBuffer components that should be cleared.
	 */

	gBufferComponents: Set<GBuffer>;

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

		const gBufferComponents = new Set<GBuffer>();
		gBufferComponents.add(GBuffer.NORMAL);
		gBufferComponents.add(GBuffer.METALNESS);
		gBufferComponents.add(GBuffer.ROUGHNESS);
		this.gBufferComponents = gBufferComponents;

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

		return this.gBufferComponents.has(GBuffer.COLOR);

	}

	set color(value: boolean) {

		if(value) {

			this.gBufferComponents.add(GBuffer.COLOR);

		} else {

			this.gBufferComponents.delete(GBuffer.COLOR);

		}

	}

}
