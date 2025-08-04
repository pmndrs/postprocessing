import { IUniform } from "three";

/**
 * Basic shader data.
 *
 * @category Core
 */

export interface ShaderData {

	/**
	 * A collection of macro definitions.
	 */

	readonly defines: Map<string, string | number | boolean>;

	/**
	 * A collection of uniforms.
	 */

	readonly uniforms: Map<string, IUniform>;

}
