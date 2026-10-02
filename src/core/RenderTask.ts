import { BaseEvent, Camera, EventDispatcher, Scene } from "three";
import { ReadonlyTimer } from "../utils/ReadonlyTimer.js";
import { BaseEventMap } from "./BaseEventMap.js";
import { Compilable } from "./Compilable.js";
import { Disposable } from "./Disposable.js";
import { Identifiable } from "./Identifiable.js";
import { GBufferSchema } from "./io/gbuffer/GBufferSchema.js";
import { Renderable } from "./Renderable.js";
import { RenderTaskContext } from "./RenderTaskContext.js";
import { Scissor } from "./Scissor.js";
import { Task } from "./Task.js";
import { Viewport } from "./Viewport.js";

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
