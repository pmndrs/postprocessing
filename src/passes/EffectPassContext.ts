import { Input } from "../core/io/Input.js";

/**
 * An {@link EffectPass} context.
 *
 * @category Passes
 * @internal
 */

export interface EffectPassContext {

	/**
	 * Input resources.
	 */

	readonly in: Input;

	/**
	 * A list of required textures.
	 */

	readonly requiredTextures: readonly string[];

}
