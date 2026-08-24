import { Camera, Scene, WebGLRenderer } from "three";

/**
 * A render task context.
 *
 * @category Core
 */

export interface RenderTaskContext {

	/**
	 * The current renderer.
	 */

	renderer: WebGLRenderer | null;

	/**
	 * The current scene.
	 *
	 * Defaults to the main scene of the associated frame graph if not defined.
	 */

	scene: Scene | null;

	/**
	 * The current camera.
	 *
	 * Defaults to the main camera of the associated frame graph if not defined.
	 */

	camera: Camera | null;

}
