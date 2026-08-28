import { Camera, Scene, Timer, Vector2, Vector4, WebGLRenderer } from "three";
import { ShaderChunkExtensions } from "../shader-chunks/ShaderChunkExtensions.js";
import { GBufferSchema } from "../utils/gbuffer/GBufferSchema.js";
import { fullscreenGeometry } from "../utils/objects/fullscreenGeometry.js";
import { ReadonlyTimer } from "../utils/ReadonlyTimer.js";
import { Disposable } from "./Disposable.js";
import { FrameGraphCompiler } from "./FrameGraphCompiler.js";
import { Renderable } from "./Renderable.js";
import { RenderTask } from "./RenderTask.js";
import { Task } from "./Task.js";

const v = /* @__PURE__ */ new Vector2();

/**
 * FrameGraph constructor options.
 *
 * @category Core
 */

export interface FrameGraphOptions {

	/**
	 * A renderer.
	 */

	renderer?: WebGLRenderer | null;

	/**
	 * A G-Buffer configuration.
	 */

	gBufferSchema?: GBufferSchema;

	/**
	 * The main scene.
	 */

	scene?: Scene | null;

	/**
	 * The main camera.
	 */

	camera?: Camera | null;

}

/**
 * A directed acyclic graph (DAG) that manages and runs render tasks to produce a frame.
 *
 * @see https://www.gdcvault.com/play/1024612/FrameGraph-Extensible-Rendering-Architecture-in
 * @see https://stoleckipawel.dev/posts/frame-graph-theory/
 * @category Core
 */

export class FrameGraph implements FrameGraphOptions, Disposable, Renderable {

	/**
	 * Keeps track of tasks that have been added to a frame graph.
	 */

	private static readonly registeredTasks = /* @__PURE__ */ new WeakSet<Task>();

	/**
	 * A frame graph compiler.
	 */

	private readonly compiler: FrameGraphCompiler;

	/**
	 * Rebuilds the graph and updates the render pipeline.
	 */

	private readonly updateRenderPipeline: () => void;

	// #region Backing Data

	/**
	 * @see {@link timer}
	 */

	private _timer: Timer;

	/**
	 * @see {@link renderer}
	 */

	private _renderer: WebGLRenderer | null;

	/**
	 * @see {@link scene}
	 */

	private _scene: Scene | null;

	/**
	 * @see {@link camera}
	 */

	private _camera: Camera | null;

	/**
	 * @see {@link gBufferSchema}
	 */

	private _gBufferSchema: GBufferSchema;

	/**
	 * @see {@link tasks}
	 */

	private readonly _tasks: Set<RenderTask>;

	/**
	 * @see {@link roots}
	 */

	private readonly _roots: Set<RenderTask>;

	// #endregion

	/**
	 * A mutation observer that handles canvas size changes.
	 */

	private readonly sizeObserver: MutationObserver | null;

	/**
	 * A render pipeline that contains executable tasks, sorted based on their dependencies.
	 */

	private renderPipeline: Task[];

	/**
	 * Constructs a new frame graph.
	 *
	 * @param options - The options.
	 */

	constructor({
		renderer = null,
		gBufferSchema = new GBufferSchema(),
		scene = null,
		camera = null
	}: FrameGraphOptions = {}) {

		ShaderChunkExtensions.register();

		this.compiler = new FrameGraphCompiler(this);
		this.updateRenderPipeline = () => {

			this.renderPipeline = this.compiler.update();

		};

		this._timer = new Timer();
		this._renderer = null;
		this._gBufferSchema = gBufferSchema;
		this._scene = scene;
		this._camera = camera;

		this._tasks = new Set();
		this._roots = new Set();
		this.renderPipeline = [];

		this.sizeObserver = this.createSizeObserver();
		this.renderer = renderer;

	}

	// #region Accessors

	/**
	 * A collection of render tasks that are part of this graph.
	 *
	 * @internal
	 */

	get tasks(): ReadonlySet<RenderTask> {

		return this._tasks;

	}

	/**
	 * A collection of render tasks that act as graph roots, i.e. terminal graph outputs.
	 *
	 * @internal
	 */

	get roots(): ReadonlySet<RenderTask> {

		return this._roots;

	}

	/**
	 * The internal timer.
	 */

	get timer(): ReadonlyTimer {

		return this._timer;

	}

	get renderer(): WebGLRenderer | null {

		return this._renderer;

	}

	set renderer(value: WebGLRenderer | null) {

		this.sizeObserver?.disconnect();
		this._renderer = value;

		for(const task of this._tasks) {

			task.renderer = value;

		}

		if(value !== null) {

			// Clearing will be handled by clear tasks.
			value.autoClear = false;

			this.updateResolution();
			this.sizeObserver?.observe(value.domElement, { attributes: true });

			if(this._tasks.size > 0) {

				this.updateRenderPipeline();

			}

		}

	}

	get scene(): Scene | null {

		return this._scene;

	}

	set scene(value: Scene | null) {

		if(this._scene === value) {

			return;

		}

		this._scene = value;

		for(const task of this._tasks) {

			task.mainScene = value;

		}

	}

	get camera(): Camera | null {

		return this._camera;

	}

	set camera(value: Camera | null) {

		if(this._camera === value) {

			return;

		}

		this._camera = value;

		for(const task of this._tasks) {

			task.mainCamera = value;

		}

	}

	get gBufferSchema(): GBufferSchema {

		return this._gBufferSchema;

	}

	set gBufferSchema(value: GBufferSchema) {

		if(this._gBufferSchema === value) {

			return;

		}

		this._gBufferSchema = value;

		for(const task of this._tasks) {

			task.gBufferSchema = value;

		}

	}

	// #endregion

	/**
	 * Creates a mutation observer for the canvas size.
	 *
	 * @return The observer.
	 */

	private createSizeObserver(): MutationObserver | null {

		if(typeof MutationObserver === "undefined") {

			return null;

		}

		const attributeNames = new Set<string>();

		return new MutationObserver((mutationsList, _observer) => {

			for(const mutation of mutationsList) {

				if(mutation.attributeName !== null) {

					attributeNames.add(mutation.attributeName);

				}

			}

			if(attributeNames.has("width") && attributeNames.has("height")) {

				// Update once both attributes have been set.
				attributeNames.clear();
				this.updateResolution();

			}

		});

	}

	/**
	 * Registers a task.
	 *
	 * @param task - The task.
	 */

	private registerTask(task: RenderTask): void {

		FrameGraph.registeredTasks.add(task);

		if(this.renderer !== null) {

			const size = this.renderer.getSize(v);
			task.resolution.pixelRatio = this.renderer.getPixelRatio();
			task.resolution.setBaseSize(size.x, size.y);

		}

		task.timer = this.timer;
		task.renderer = this.renderer;
		task.gBufferSchema = this.gBufferSchema;

		task.addEventListener("toggle", this.updateRenderPipeline);
		task.input.addEventListener("change", this.updateRenderPipeline);
		task.output.addEventListener("change", this.updateRenderPipeline);

	}

	/**
	 * Unregisters a task.
	 *
	 * @param task - The task.
	 */

	private unregisterTask(task: RenderTask): void {

		FrameGraph.registeredTasks.delete(task);

		task.timer = null;
		task.renderer = null;
		task.gBufferSchema = null;

		task.removeEventListener("toggle", this.updateRenderPipeline);
		task.input.removeEventListener("change", this.updateRenderPipeline);
		task.output.removeEventListener("change", this.updateRenderPipeline);

		if(this._roots.has(task)) {

			this._roots.delete(task);

		}

	}

	/**
	 * Adds one or more render tasks.
	 *
	 * @throws If one of the tasks has already been added to another frame graph.
	 * @param tasks - The tasks to add.
	 */

	add(...tasks: RenderTask[]): void {

		for(const task of tasks) {

			if(this._tasks.has(task)) {

				continue;

			} else if(FrameGraph.registeredTasks.has(task)) {

				throw new Error(`The task "${task.name}" has already been added to another frame graph`);

			}

			this.registerTask(task);
			this._tasks.add(task);

		}

		this.updateRenderPipeline();

	}

	/**
	 * Removes one or more render tasks.
	 *
	 * Existing output declarations for removed tasks will also be removed.
	 *
	 * @param tasks - The tasks to remove.
	 */

	remove(...tasks: RenderTask[]): void {

		let removedAny = false;

		for(const task of tasks) {

			if(this._tasks.delete(task)) {

				this.unregisterTask(task);
				removedAny = true;

			}

		}

		if(removedAny) {

			this.updateRenderPipeline();

		}

	}

	/**
	 * Removes all render tasks.
	 *
	 * @remarks This method does not dispose the tasks.
	 * @see {@link dispose} for disposing all tasks.
	 */

	clear(): void {

		for(const task of this._tasks) {

			this.unregisterTask(task);

		}

		this._tasks.clear();
		this._roots.clear();
		this.updateRenderPipeline();

	}

	/**
	 * Declares one or more render tasks as terminal graph outputs.
	 *
	 * @remarks Removing tasks through {@link remove} also deletes the corresponding output declarations.
	 * @throws If any of the tasks is not part of this frame graph.
	 * @param tasks - The tasks to declare as outputs.
	 */

	output(...tasks: RenderTask[]): void {

		for(const task of tasks) {

			if(!this._tasks.has(task)) {

				throw new Error(`The task "${task.name}" is not part of this frame graph`);

			}

			this._roots.add(task);

		}

		this.updateRenderPipeline();

	}

	/**
	 * Updates the resolution based on the renderer size.
	 */

	private updateResolution(): void {

		if(this.renderer === null) {

			return;

		}

		const logicalSize = this.renderer.getSize(v);
		const pixelRatio = this.renderer.getPixelRatio();

		for(const task of this._tasks) {

			task.resolution.pixelRatio = pixelRatio;
			task.resolution.setBaseSize(logicalSize.width, logicalSize.height);

		}

		this.compiler.updateResolution();

	}

	/**
	 * Sets the viewport for all render tasks.
	 *
	 * Please note that viewport settings need to be enabled on a per-task basis to take effect.
	 *
	 * @param x - The X-offset starting in the lower left corner, or a vector that describes the viewport.
	 * @param y - The Y-offset starting in the lower left corner.
	 * @param width - The width in logical pixels (before pixel ratio).
	 * @param height - The height in logical pixels (before pixel ratio).
	 */

	setViewport(x: number | Vector4, y = 0, width = 0, height = 0): void {

		if(x instanceof Vector4) {

			const v = x;
			x = v.x;
			y = v.y;
			width = v.z;
			height = v.w;

		}

		for(const task of this._tasks) {

			task.viewport.set(x, y, width, height);

		}

	}

	/**
	 * Sets the scissor region for all render tasks.
	 *
	 * Please note that scissor settings need to be enabled on a per-task basis to take effect.
	 *
	 * @param x - The X-offset, or a vector that describes the scissor region.
	 * @param y - The Y-offset starting in the lower left corner.
	 * @param width - The width in logical pixels (before pixel ratio).
	 * @param height - The height in logical pixels (before pixel ratio).
	 */

	setScissor(x: number | Vector4, y = 0, width = 0, height = 0): void {

		if(x instanceof Vector4) {

			const v = x;
			x = v.x;
			y = v.y;
			width = v.z;
			height = v.w;

		}

		for(const task of this._tasks) {

			task.scissor.set(x, y, width, height);

		}

	}

	/**
	 * Compiles all shaders used in this frame graph.
	 *
	 * It's recommended to call this method before the first render call to avoid initial frame stutters. Tasks may also
	 * be compiled individually as needed, e.g. when the shader materials of a task have changed.
	 *
	 * @example frameGraph.compile().then(() => renderer.setAnimationLoop(render));
	 * @return A promise that resolves when the compilation has finished.
	 */

	async compile(): Promise<void> {

		const promises: Promise<void>[] = [];

		for(const task of this._tasks) {

			promises.push(task.compile());

		}

		await Promise.all(promises);

	}

	/**
	 * Renders this frame graph.
	 *
	 * This method should be called once per frame via `requestAnimationFrame`. It's recommended to use three's method
	 * `WebGLRenderer.setAnimationLoop()` to set up a render loop.
	 *
	 * @example renderer.setAnimationLoop((timestamp) => frameGraph.render(timestamp));
	 * @see https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame
	 * @see https://threejs.org/docs/?q=renderer#api/en/renderers/WebGLRenderer.setAnimationLoop
	 * @param timestamp - The current time in milliseconds.
	 */

	render(timestamp?: number): void {

		this._timer.update(timestamp);
		const renderer = this._renderer;

		if(renderer === null) {

			return;

		}

		const autoResetRenderInfo = renderer.info.autoReset;

		if(autoResetRenderInfo) {

			renderer.info.reset();
			renderer.info.autoReset = false;

		}

		for(const task of this.renderPipeline) {

			task.execute();

		}

		renderer.info.autoReset = autoResetRenderInfo;

	}

	dispose(): void {

		this.compiler.dispose();

		for(const task of this._tasks) {

			task.dispose();

		}

		this.clear();
		this._timer.dispose();

		fullscreenGeometry.dispose();

	}

}
