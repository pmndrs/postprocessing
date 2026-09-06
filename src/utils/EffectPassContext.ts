import { Input } from "../core/io/Input.js";

/**
 * An {@link EffectPass} context.
 *
 * @category Utils
 * @internal
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
