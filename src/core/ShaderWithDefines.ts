import { Shader } from "three";

/**
 * Workaround for missing `defines` on `Shader` type.
 *
 * @ignore
 * @group Core
 */

export interface ShaderWithDefines extends Shader {

	/**
	 * A collection of macro definitions.
	 */

	defines?: Record<string, string | number | boolean>;

}
