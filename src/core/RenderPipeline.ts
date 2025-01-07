import { Material, Vector2, Vector4, WebGLRenderer } from "three";
import { Timer } from "three/examples/jsm/misc/Timer.js";
import { ShaderChunkExtensions } from "../shader-chunks/ShaderChunkExtensions.js";
import { ImmutableTimer } from "../utils/ImmutableTimer.js";
import { Resolution } from "../utils/Resolution.js";
import { IOManager } from "./io/IOManager.js";
import { Disposable } from "./Disposable.js";
import { Renderable } from "./Renderable.js";
import { Resizable } from "./Resizable.js";
import { Pass } from "./Pass.js";
import { Input } from "./io/Input.js";
import { Output } from "./io/Output.js";

const v = /* @__PURE__ */ new Vector2();

/**
 * A render pipeline that can be used to group and run passes.
 *
 * @category Core
 */

export class RenderPipeline implements Disposable, Renderable, Resizable {

	/**
	 * A shared I/O manager.
	 */

	private static readonly ioManager = /* @__PURE__ */ new IOManager();

	/**
	 * Keeps track of passes that have been added to a pipeline.
	 */

	private static readonly registeredPasses = /* @__PURE__ */ new WeakSet<Pass<Material | null>>();

	/**
	 * A listener that triggers an I/O update.
	 */

	private static readonly listener = /* @__PURE__ */ () => RenderPipeline.ioManager.update();

	// #region Backing Data

	/**
	 * @see {@link timer}
	 */

	private _timer: Timer;

	/**
	 * @see {@link passes}
	 */

	private _passes: Pass<Material | null>[];

	/**
	 * @see {@link renderer}
	 */

	private _renderer: WebGLRenderer | null;

	/**
	 * @see {@link autoRenderToScreen}
	 */

	private _autoRenderToScreen: boolean;

	// #endregion

	/**
	 * The current resolution.
	 *
	 * @see {@link updateStyle}
	 */

	readonly resolution: Resolution;

	/**
	 * Determines whether the style of the canvas should be updated when the resolution is changed.
	 *
	 * @defaultValue true
	 */

	updateStyle: boolean;

	/**
	 * Constructs a new render pipeline.
	 *
	 * @param renderer - A renderer.
	 */

	constructor(renderer: WebGLRenderer | null = null) {

		ShaderChunkExtensions.register();
		RenderPipeline.ioManager.addPipeline(this);

		this._timer = new Timer();
		this._passes = [];
		this._renderer = null;
		this._autoRenderToScreen = true;

		this.renderer = renderer;
		this.resolution = new Resolution();
		this.resolution.addEventListener("change", () => this.onResolutionChange());
		this.updateStyle = true;

	}

	/**
	 * Determines whether the last pass should automatically render to screen.
	 *
	 * @defaultValue true
	 */

	get autoRenderToScreen(): boolean {

		return this._autoRenderToScreen;

	}

	set autoRenderToScreen(value: boolean) {

		if(this.autoRenderToScreen !== value) {

			this._autoRenderToScreen = value;
			RenderPipeline.ioManager.update();

		}

	}

	/**
	 * The renderer.
	 */

	get renderer(): WebGLRenderer | null {

		return this._renderer;

	}

	set renderer(value: WebGLRenderer | null) {

		this._renderer = value;

		for(const pass of this.passes) {

			pass.renderer = value;

		}

		if(value !== null) {

			// Clearing will be done with ClearPass instances.
			value.autoClear = false;

			if(this.passes.length > 0) {

				// Update the render resolution and refresh the buffers.
				this.onResolutionChange();
				RenderPipeline.ioManager.update();

			}

		}

	}

	/**
	 * The internal timer.
	 */

	get timer(): ImmutableTimer {

		return this._timer;

	}

	/**
	 * A list of all registered passes.
	 */

	get passes(): readonly Pass<Material | null>[] {

		return this._passes;

	}

	/**
	 * Registers a pass.
	 *
	 * @param pass - The pass.
	 */

	private registerPass(pass: Pass<Material | null>): void {

		RenderPipeline.registeredPasses.add(pass);

		if(this.renderer !== null) {

			this.renderer.getDrawingBufferSize(v);
			pass.resolution.setBaseSize(v.width, v.height);
			pass.viewport.copyBaseSize(this.resolution);
			pass.scissor.copyBaseSize(this.resolution);

		}

		pass.renderer = this.renderer;
		pass.timer = this.timer;
		pass.attached = true;

		pass.addEventListener(Pass.EVENT_TOGGLE, RenderPipeline.listener);
		pass.input.addEventListener(Input.EVENT_CHANGE, RenderPipeline.listener);
		pass.output.addEventListener(Output.EVENT_CHANGE, RenderPipeline.listener);

	}

	/**
	 * Unregisters a pass.
	 *
	 * @param pass - The pass.
	 */

	private unregisterPass(pass: Pass<Material | null>): void {

		RenderPipeline.registeredPasses.delete(pass);

		pass.renderer = null;
		pass.timer = null;
		pass.attached = false;

		pass.removeEventListener(Pass.EVENT_TOGGLE, RenderPipeline.listener);
		pass.input.removeEventListener(Input.EVENT_CHANGE, RenderPipeline.listener);
		pass.output.removeEventListener(Output.EVENT_CHANGE, RenderPipeline.listener);

	}

	/**
	 * Adds one or more passes.
	 *
	 * @throws If the pass has already been added to a pipeline.
	 * @param passes - The passes to add.
	 */

	add(...passes: Pass<Material | null>[]): void {

		for(const pass of passes) {

			if(RenderPipeline.registeredPasses.has(pass)) {

				throw new Error(`The pass "${pass.name}" has already been added to a pipeline`);

			}

			this.registerPass(pass);
			this._passes.push(pass);

		}

		RenderPipeline.ioManager.update();

	}

	/**
	 * Removes one or more passes.
	 *
	 * @param passes - The passes to remove.
	 */

	remove(...passes: Pass<Material | null>[]): void {

		let removedAny = false;

		for(const pass of passes) {

			const passes = this._passes;
			const index = passes.indexOf(pass);
			const exists = (index !== -1);
			const removed = exists && (passes.splice(index, 1).length > 0);

			if(removed) {

				this.unregisterPass(pass);
				removedAny = true;

			}

		}

		if(removedAny) {

			RenderPipeline.ioManager.update();

		}

	}

	/**
	 * Removes all passes.
	 */

	removeAllPasses(): void {

		for(const pass of this.passes) {

			this.unregisterPass(pass);

		}

		this._passes = [];
		RenderPipeline.ioManager.update();

	}

	/**
	 * Handles resolution change events.
	 */

	private onResolutionChange(): void {

		if(this.renderer === null) {

			console.debug("Unable to update the render size because the renderer is null");
			return;

		}

		const resolution = this.resolution;
		const width = resolution.width;
		const height = resolution.height;
		const logicalSize = this.renderer.getSize(v);

		if(logicalSize.width !== width || logicalSize.height !== height) {

			this.renderer.setSize(width, height, this.updateStyle);

		}

		// The drawing buffer size takes the device pixel ratio into account.
		const effectiveSize = this.renderer.getDrawingBufferSize(v);

		for(const pass of this.passes) {

			pass.resolution.setBaseSize(effectiveSize.width, effectiveSize.height);
			pass.viewport.copyBaseSize(resolution);
			pass.scissor.copyBaseSize(resolution);

		}

	}

	/**
	 * Sets the render size.
	 *
	 * @param width - The width in logical pixels (before pixel ratio).
	 * @param height - The height in logical pixels (before pixel ratio).
	 * @param updateStyle - Whether the style of the canvas should be updated. Default is `true`.
	 */

	setSize(width: number, height: number, updateStyle = true): void {

		this.updateStyle = updateStyle;
		this.resolution.setBaseSize(width, height);

	}

	/**
	 * Sets the viewport for all passes.
	 *
	 * Please note that viewport settings need to be enabled on a per-pass basis to take effect.
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

		for(const pass of this.passes) {

			pass.viewport.setOffset(x, y);
			pass.viewport.setBaseSize(width, height);

		}

	}

	/**
	 * Sets the scissor region for all passes.
	 *
	 * Please note that scissor settings need to be enabled on a per-pass basis to take effect.
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

		for(const pass of this.passes) {

			pass.scissor.setOffset(x, y);
			pass.scissor.setBaseSize(width, height);

		}

	}

	/**
	 * Compiles all passes in this pipeline.
	 *
	 * @return A promise that resolves when the compilation has finished.
	 */

	async compile(): Promise<void> {

		const promises: Promise<void>[] = [];

		for(const pass of this.passes) {

			promises.push(pass.compile());

		}

		await Promise.all(promises);

	}

	/**
	 * Renders this pipeline.
	 *
	 * This method should be called once per frame via `requestAnimationFrame`.
	 *
	 * @see https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame
	 * @param timestamp - The current time in milliseconds.
	 */

	render(timestamp?: number): void {

		if(this.renderer === null) {

			return;

		}

		this._timer.update(timestamp);

		for(const pass of this.passes) {

			if(pass.enabled) {

				pass.render();

			}

		}

	}

	dispose(): void {

		RenderPipeline.ioManager.removePipeline(this);

		for(const pass of this.passes) {

			pass.dispose();

		}

		this.removeAllPasses();
		this._timer.dispose();

		Pass.fullscreenGeometry.dispose();

	}

}
