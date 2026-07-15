import { IUniform } from "three";

/**
 * Immutable shader data.
 *
 * @category Utils
 */

export interface ReadonlyShaderData {

	/**
	 * A collection of macro definitions.
	 */

	readonly defines: ReadonlyMap<string, string | number | boolean>;

	/**
	 * A collection of uniforms.
	 */

	readonly uniforms: ReadonlyMap<string, IUniform>;

}
