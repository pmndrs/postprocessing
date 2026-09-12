import { Camera, Scene, WebGLRenderer } from "three";
import { Resolution } from "../utils/Resolution.js";
import { InOut } from "./io/InOut.js";
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
	 *
	 * Input resources are owned by another task and consumed by this task.
	 */

	readonly in: Input;

	/**
	 * The output resources of this task.
	 *
	 * Output resources are owned by this task and can be consumed by other tasks.
	 */

	readonly out: Output;

	/**
	 * The in-out render target resource connections of this task.
	 *
	 * Unlike output resources, in-out resources are owned by another pass. Connecting an in-out resource creates a
	 * dependency on the pass that produces the resource and allows multiple passes to render into the same materialized
	 * render target without copying its contents.
	 */

	readonly inOut: InOut;

	/**
	 * The current resolution.
	 */

	readonly resolution: Resolution;

}
