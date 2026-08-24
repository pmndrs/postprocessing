/**
 * Describes objects that can compile shaders.
 *
 * @category Core
 */

export interface Compilable {

	/**
	 * Compiles the shaders used by this object.
	 *
	 * @return A promise that resolves when the compilation has finished.
	 */

	compile(): Promise<void>;

}
