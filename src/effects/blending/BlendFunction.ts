/**
 * An abstract blend function.
 *
 * @group Blending
 */

export abstract class BlendFunction {

	/**
	 * The next blend function ID.
	 */

	private static nextId = 0;

	/**
	 * A unique blend function ID.
	 */

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

		this.id = BlendFunction.nextId++;
		this.name = name;
		this.shader = shader;
		this.supportsHDR = supportsHDR;

	}

}
