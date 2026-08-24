import { Input } from "../core/io/Input.js";

/**
 * An {@link EffectPass} context.
 *
 * @see {@link EffectMaterialCache}
 * @category Utils
 */

export interface EffectPassContext {

	/**
	 * Input resources.
	 */

	readonly input: Input;

	/**
	 * A list of required textures.
	 */

	readonly requiredTextures: readonly string[];

}
