import { Color, Vector4 } from "three";
import { GBuffer } from "../enums/GBuffer.js";

/**
 * A collection of clear values.
 *
 * @category Utils
 */

export class ClearValues {

	/**
	 * A clear color that overrides the clear color of the renderer.
	 *
	 * @defaultValue null
	 */

	color: Color | null;

	/**
	 * A clear alpha value that overrides the clear alpha of the renderer.
	 *
	 * @defaultValue null
	 */

	alpha: number | null;

	/**
	 * A collection that maps {@link GBuffer} components to clear values.
	 */

	readonly gBuffer: Map<GBuffer | string, Vector4>;

	/**
	 * Constructs new clear values.
	 */

	constructor() {

		this.color = null;
		this.alpha = null;

		this.gBuffer = new Map<GBuffer | string, Vector4>([
			[GBuffer.NORMAL, new Vector4(0.5, 0.5, 1.0, 1.0)],
			[GBuffer.ORM, new Vector4(1.0, 0.0, 0.0, 1.0)],
			[GBuffer.EMISSION, new Vector4(0.0, 0.0, 0.0, 1.0)]
		]);

	}

}
