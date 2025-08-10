import { Material, Timer, Vector2, Vector4, WebGLRenderer } from "three";
import { ShaderChunkExtensions } from "../shader-chunks/ShaderChunkExtensions.js";
import { ImmutableTimer } from "../utils/ImmutableTimer.js";
import { Resolution } from "../utils/Resolution.js";
import { IOManager } from "./io/IOManager.js";
import { Disposable } from "./Disposable.js";
import { Renderable } from "./Renderable.js";
import { Resizable } from "./Resizable.js";
import { Pass } from "./Pass.js";

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
	 * @see {@link updateStyle} to control whether the style of the canvas should be updated.
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

		this.resolution = new Resolution();
		this.resolution.addEventListener("change", () => this.onResolutionChange());
		this.updateStyle = true;
		this.renderer = renderer;

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

			// Updating the pixel ratio also triggers onResolutionChange.
			this.setPixelRatio(value.getPixelRatio());

			if(this.passes.length > 0) {

				// Refresh the buffers.
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

		// Use the scaled pixel ratio to keep the resolution scale of the pass intact.
		pass.resolution.pixelRatio = this.resolution.scaledPixelRatio;
		pass.resolution.copyBaseSize(this.resolution);

		pass.renderer = this.renderer;
		pass.timer = this.timer;
		pass.attached = true;

		pass.addEventListener("toggle", RenderPipeline.listener);
		pass.input.addEventListener("change", RenderPipeline.listener);
		pass.output.addEventListener("change", RenderPipeline.listener);

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

		pass.removeEventListener("toggle", RenderPipeline.listener);
		pass.input.removeEventListener("change", RenderPipeline.listener);
		pass.output.removeEventListener("change", RenderPipeline.listener);

	}

	/**
	 * Adds one or more passes.
	 *
	 * @throws If one of the passes has already been added to a pipeline.
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

		const renderer = this.renderer;

		if(renderer === null) {

			console.debug("Unable to update the render size because the renderer is null");
			return;

		}

		const { baseWidth, baseHeight, pixelRatio, scaledPixelRatio, scale } = this.resolution;
		const logicalSize = renderer.getSize(v);

		if(renderer.getPixelRatio() !== pixelRatio) {

			// Sync the pixel ratio with the renderer.
			renderer.setPixelRatio(pixelRatio);

		}

		if(scale === 1.0) {

			if(logicalSize.width !== baseWidth || logicalSize.height !== baseHeight) {

				renderer.setSize(baseWidth, baseHeight, this.updateStyle);

			}

		} else {

			// The scale acts like an additional pixel ratio.
			const scaledWidth = baseWidth * scale;
			const scaledHeight = baseHeight * scale;

			// Three stores the exact width and height internally and floors the canvas size after applying the pixel ratio.
			if(logicalSize.width !== scaledWidth || logicalSize.height !== scaledHeight) {

				if(this.updateStyle) {

					// Set the logical size and update the canvas style.
					renderer.setSize(baseWidth, baseHeight, true);

				}

				// Set the scaled logical size without changing the canvas style.
				renderer.setSize(scaledWidth, scaledHeight, false);

			}

		}

		for(const pass of this.passes) {

			// Use the scaled pixel ratio as a baseline to keep the resolution scale of the passes intact.
			pass.resolution.pixelRatio = scaledPixelRatio;
			pass.resolution.setBaseSize(baseWidth, baseHeight);

		}

	}

	/**
	 * Sets the device pixel ratio.
	 *
	 * @param pixelRatio - The pixel ratio.
	 */

	setPixelRatio(pixelRatio: number): void {

		const previousUpdateStyle = this.updateStyle;
		this.updateStyle = false;
		this.resolution.pixelRatio = pixelRatio;
		this.updateStyle = previousUpdateStyle;

	}

	/**
	 * Sets the render size.
	 *
	 * @param width - The width in logical pixels (before pixel ratio).
	 * @param height - The height in logical pixels (before pixel ratio).
	 * @param updateStyle - Whether the style of the canvas should be updated. Default is `true`.
	 */

	setSize(width: number, height: number, updateStyle = true): void {

		if(this.renderer !== null) {

			// Sync the pixel ratio with the renderer.
			this.setPixelRatio(this.renderer.getPixelRatio());

		}

		const previousUpdateStyle = this.updateStyle;
		this.updateStyle = updateStyle;
		this.resolution.setSize(width, height);
		this.updateStyle = previousUpdateStyle;

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

			pass.viewport.set(x, y, width, height);

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

			pass.scissor.set(x, y, width, height);

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
