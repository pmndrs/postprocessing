import { Identifiable } from "../../core/Identifiable.js";
import { IdManager } from "../../utils/IdManager.js";

/**
 * An abstract blend function.
 *
 * @category Blending
 */

export abstract class BlendFunction implements Identifiable {

	/**
	 * An ID manager.
	 */

	private static idManager = /* @__PURE__ */ new IdManager();

	readonly id: number;

	/**
	 * A unique blend function name.
	 */

	readonly name: string;

	/**
	 * The shader code.
	 */

	readonly shader: string | null;

	/**
	 * Indicates whether this blend function supports HDR colors.
	 *
	 * Shaders that assume a color value range of [0, 1] are not compatible with HDR.
	 */

	readonly supportsHDR: boolean;

	/**
	 * Constructs a new blend function.
	 *
	 * @param name - A unique blend function name.
	 * @param shader - The shader code.
	 * @param supportsHDR - Indicates whether this blend function supports HDR colors.
	 */

	constructor(name: string, shader: string | null, supportsHDR = false) {

		this.id = BlendFunction.idManager.getNextId();
		this.name = name;
		this.shader = shader;
		this.supportsHDR = supportsHDR;

	}

}
