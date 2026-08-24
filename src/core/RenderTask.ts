import { BaseEvent, Camera, EventDispatcher, Scene } from "three";
import { GBufferSchema } from "../utils/gbuffer/GBufferSchema.js";
import { ReadonlyTimer } from "../utils/ReadonlyTimer.js";
import { Resolution } from "../utils/Resolution.js";
import { Scissor } from "../utils/Scissor.js";
import { Viewport } from "../utils/Viewport.js";
import { BaseEventMap } from "./BaseEventMap.js";
import { Compilable } from "./Compilable.js";
import { Disposable } from "./Disposable.js";
import { Identifiable } from "./Identifiable.js";
import { Input } from "./io/Input.js";
import { Output } from "./io/Output.js";
import { Renderable } from "./Renderable.js";
import { RenderTaskContext } from "./RenderTaskContext.js";
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

export interface RenderTask extends EventDispatcher<RenderTaskEventMap>,
	Compilable, Disposable, Identifiable, Renderable, RenderTaskContext, Task {

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

}
