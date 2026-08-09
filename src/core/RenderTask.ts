import { BaseEvent, Camera, EventDispatcher, Scene, WebGLRenderer } from "three";
import { GBufferSchema } from "../utils/gbuffer/GBufferSchema.js";
import { ReadonlyTimer } from "../utils/ReadonlyTimer.js";
import { Resolution } from "../utils/Resolution.js";
import { Scissor } from "../utils/Scissor.js";
import { Viewport } from "../utils/Viewport.js";
import { BaseEventMap } from "./BaseEventMap.js";
import { Disposable } from "./Disposable.js";
import { Identifiable } from "./Identifiable.js";
import { Input } from "./io/Input.js";
import { Output } from "./io/Output.js";
import { Renderable } from "./Renderable.js";
import { Task } from "./Task.js";

/**
 * RenderTask events.
 *
 * @category Core
 */

export interface RenderTaskEventMap extends BaseEventMap {

	/**
	 * Triggers when the render task gets enabled or disabled.
	 *
	 * @event
	 */

	toggle: BaseEvent<"toggle">;

}

/**
 * A render task.
 *
 * @category Core
 */

export interface RenderTask extends EventDispatcher<RenderTaskEventMap>, Disposable, Identifiable, Renderable, Task {

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

	/**
	 * The viewport.
	 *
	 * @see {@link Viewport.enabled} to enable the viewport.
	 */

	readonly viewport: Viewport;

	/**
	 * A rectangular area inside the viewport. Fragments outside this area will not be rendered.
	 *
	 * @see {@link Scissor.enabled} to enable the scissor.
	 */

	readonly scissor: Scissor;

	/**
	 * A timer.
	 */

	timer: ReadonlyTimer | null;

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

	// #region Internal

	/**
	 * The current G-Buffer schema.
	 *
	 * @internal
	 */

	set gBufferSchema(value: GBufferSchema | null);

	/**
	 * The main scene.
	 *
	 * @internal
	 */

	set mainScene(value: Scene | null);

	/**
	 * The main camera.
	 *
	 * @internal
	 */

	set mainCamera(value: Camera | null);

	/**
	 * A list of subtasks.
	 *
	 * @internal
	 */

	readonly subtasks: readonly RenderTask[];

	// #endregion

	/**
	 * Compiles the resources used by this task.
	 *
	 * @return A promise that resolves when the compilation has finished.
	 */

	compile(): Promise<void>;

}
