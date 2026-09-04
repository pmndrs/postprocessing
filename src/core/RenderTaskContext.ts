import { Camera, Scene, WebGLRenderer } from "three";
import { Resolution } from "../utils/Resolution.js";
import { Input } from "./io/Input.js";
import { Output } from "./io/Output.js";

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

	/**
	 * The input resources of this task.
	 */

	readonly input: Input;

	/**
	 * The output resources of this task.
	 */

	readonly output: Output;

	/**
	 * The current resolution.
	 */

	readonly resolution: Resolution;

}
