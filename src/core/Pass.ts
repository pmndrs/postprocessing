import {
	BaseEvent,
	BufferAttribute,
	BufferGeometry,
	Camera,
	Event,
	EventDispatcher,
	Material,
	Mesh,
	OrthographicCamera,
	PerspectiveCamera,
	RawShaderMaterial,
	Scene,
	ShaderMaterial,
	Texture,
	Uniform,
	WebGLRenderTarget,
	WebGLRenderer
} from "three";

import { Input } from "./io/Input.js";
import { Output } from "./io/Output.js";
import { FullscreenMaterial } from "../materials/FullscreenMaterial.js";
import { IdManager } from "../utils/IdManager.js";
import { ImmutableTimer } from "../utils/ImmutableTimer.js";
import { Resolution } from "../utils/Resolution.js";
import { BaseEventMap } from "./BaseEventMap.js";
import { Disposable } from "./Disposable.js";
import { Identifiable } from "./Identifiable.js";
import { Renderable } from "./Renderable.js";
import { Viewport } from "../utils/Viewport.js";
import { Scissor } from "../utils/Scissor.js";

/**
 * Pass events.
 *
 * @category Core
 */

export interface PassEventMap extends BaseEventMap {

	toggle: BaseEvent;

}

/**
 * An abstract pass.
 *
 * @param TMaterial - The type of the fullscreen material, or null if this pass has none.
 * @category Core
 */

export abstract class Pass<TMaterial extends Material | null = null>
	extends EventDispatcher<PassEventMap> implements Disposable, Identifiable, Renderable {

	// #region Events

	/**
	 * Triggers when this pass has changed and requires a full update.
	 *
	 * @event
	 */

	static readonly EVENT_CHANGE = "change";

	/**
	 * Triggers when this pass changes its enabled state.
	 *
	 * @event
	 */

	static readonly EVENT_TOGGLE = "toggle";

	// #endregion

	/**
	 * A shared fullscreen triangle.
	 *
	 * The screen size is 2x2 units (NDC). A triangle needs to be 4x4 units to fill the screen.
	 * @see https://michaldrobot.com/2014/04/01/gcn-execution-patterns-in-full-screen-passes/
	 * @internal
	 */

	static readonly fullscreenGeometry = /* @__PURE__ */ (() => {

		const vertices = new Float32Array([-1, -1, 0, 3, -1, 0, -1, 3, 0]);
		const geometry = new BufferGeometry();
		geometry.setAttribute("position", new BufferAttribute(vertices, 3));
		return geometry;

	})();

	/**
	 * An ID manager.
	 */

	private static idManager = /* @__PURE__ */ new IdManager();

	readonly id: number;

	/**
	 * Keeps track of previous input defines.
	 */

	private readonly previousDefines: Map<string, string | number | boolean>;

	/**
	 * Keeps track of previous input uniforms.
	 */

	private readonly previousUniforms: Map<string, Uniform>;

	/**
	 * A scene that contains the fullscreen mesh.
	 */

	private fullscreenScene: Scene | null;

	/**
	 * A fullscreen camera.
	 */

	private fullscreenCamera: Camera | null;

	/**
	 * A fullscreen mesh.
	 */

	private screen: Mesh | null;

	// #region Backing Data

	/**
	 * @see {@link Pass.prototype.name}
	 */

	private _name: string;

	/**
	 * @see {@link enabled}
	 */

	private _enabled: boolean;

	/**
	 * @see {@link attached}
	 */

	private _attached: boolean;

	/**
	 * @see {@link timer}
	 */

	private _timer: ImmutableTimer | null;

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

	private _camera: OrthographicCamera | PerspectiveCamera | null;

	/**
	 * @see {@link subpasses}
	 */

	private _subpasses: Pass<Material | null>[];

	// #endregion

	/**
	 * A collection of objects that will be disposed when this pass is disposed.
	 *
	 * IO resources and subpasses will be disposed separately and don't need to be added.
	 */

	protected readonly disposables: Set<Disposable>;

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
	 * A rectangular area inside the viewport. Fragments that are outside the area will not be rendered.
	 *
	 * @see {@link Scissor.enabled} to enable the scissor.
	 */

	readonly scissor: Scissor;

	/**
	 * The input resources of this pass.
	 */

	readonly input: Input;

	/**
	 * The output resources of this pass.
	 */

	readonly output: Output;

	/**
	 * Constructs a new pass.
	 *
	 * @param name - A name that will be used for debugging purposes.
	 */

	constructor(name: string) {

		super();

		this.previousDefines = new Map<string, string | number | boolean>();
		this.previousUniforms = new Map<string, Uniform>();

		this.fullscreenScene = null;
		this.fullscreenCamera = null;
		this.screen = null;

		this._name = name;
		this._enabled = true;
		this._attached = false;
		this._renderer = null;
		this._timer = null;
		this._scene = null;
		this._camera = null;
		this._subpasses = [];

		this.id = Pass.idManager.getNextId();
		this.disposables = new Set<Disposable>();

		this.resolution = new Resolution();
		this.viewport = new Viewport();
		this.scissor = new Scissor();
		this.resolution.addEventListener(Resolution.EVENT_CHANGE, (e) => this.handleResolutionEvent(e));
		this.viewport.addEventListener(Viewport.EVENT_CHANGE, (e) => this.handleViewportEvent(e));
		this.scissor.addEventListener(Scissor.EVENT_CHANGE, (e) => this.handleScissorEvent(e));

		this.input = new Input();
		this.output = new Output();
		this.input.addEventListener(Input.EVENT_CHANGE, (e) => this.handleInputEvent(e));
		this.output.addEventListener(Output.EVENT_CHANGE, (e) => this.handleOutputEvent(e));

	}

	/**
	 * The name of this pass.
	 */

	get name(): string {

		return this._name;

	}

	protected set name(value: string) {

		this._name = value;

	}

	/**
	 * Indicates whether this pass is enabled.
	 */

	get enabled(): boolean {

		return this._enabled;

	}

	set enabled(value: boolean) {

		this._enabled = value;
		this.dispatchEvent({ type: Pass.EVENT_TOGGLE });

	}

	/**
	 * Indicates whether this pass is currently attached to a render pipeline.
	 */

	get attached(): boolean {

		return this._attached;

	}

	set attached(value: boolean) {

		this._attached = value;

		this.input.setChanged();
		this.output.setChanged();
		this.resolution.setChanged();

	}

	/**
	 * A list of subpasses.
	 *
	 * Subpasses are included in automatic resource optimizations and will be disposed when the parent pass is disposed.
	 * The resolution, viewport and scissor of the subpasses are also kept in sync with the parent pass.
	 *
	 * They also gain access to the following data:
	 * - {@link timer}
	 * - {@link renderer}
	 * - {@link scene}
	 * - {@link camera}
	 * - {@link attached}
	 */

	get subpasses(): readonly Pass<Material | null>[] {

		return this._subpasses;

	}

	protected set subpasses(value: Pass<Material | null>[]) {

		// Detach the current subpasses.
		for(const pass of this.subpasses) {

			pass.attached = false;

		}

		for(const pass of value) {

			if(pass.attached) {

				throw new Error(`${pass.name} is already attached to another pass`);

			}

		}

		this._subpasses = value;
		Object.freeze(this._subpasses);

		this.initializeSubpasses();

	}

	/**
	 * A timer.
	 */

	get timer(): ImmutableTimer | null {

		return this._timer;

	}

	set timer(value: ImmutableTimer | null) {

		this._timer = value;

		for(const pass of this.subpasses) {

			pass.timer = value;

		}

	}

	/**
	 * The current renderer.
	 */

	get renderer(): WebGLRenderer | null {

		return this._renderer;

	}

	set renderer(value: WebGLRenderer | null) {

		this._renderer = value;

		try {

			if(value?.capabilities !== undefined) {

				this.checkRequirements(value);

			}

		} catch(e) {

			console.warn(e);
			console.info("Disabling pass:", this);
			this.enabled = false;

		}

		for(const pass of this.subpasses) {

			pass.renderer = value;

		}

	}

	/**
	 * The main scene.
	 */

	get scene(): Scene | null {

		return this._scene;

	}

	set scene(value: Scene | null) {

		this._scene = value;

		for(const pass of this.subpasses) {

			pass.scene = value;

		}

	}

	/**
	 * The main camera.
	 */

	get camera(): OrthographicCamera | PerspectiveCamera | null {

		return this._camera;

	}

	set camera(value: OrthographicCamera | PerspectiveCamera | null) {

		this._camera = value;

		if(value !== null && this.fullscreenMaterial instanceof FullscreenMaterial) {

			this.fullscreenMaterial.copyCameraSettings(value);

		}

		for(const pass of this.subpasses) {

			pass.camera = value;

		}

	}

	/**
	 * The current fullscreen material.
	 */

	get fullscreenMaterial(): TMaterial {

		return this.screen?.material as TMaterial;

	}

	protected set fullscreenMaterial(value: TMaterial) {

		if(this.screen !== null) {

			this.screen.material = value!;

		} else {

			this.screen = new Mesh(Pass.fullscreenGeometry, value!);
			this.screen.frustumCulled = false;
			this.fullscreenScene = new Scene();
			this.fullscreenCamera = new OrthographicCamera(-1, 1, 1, -1, 0, 1);
			this.fullscreenScene.add(this.screen);

		}

	}

	/**
	 * Sets the base settings of all subpasses.
	 */

	private initializeSubpasses(): void {

		for(const pass of this.subpasses) {

			pass.timer = this.timer;
			pass.renderer = this.renderer;
			pass.scene = this.scene;
			pass.camera = this.camera;
			pass.viewport.copy(this.viewport);
			pass.scissor.copy(this.scissor);
			pass.attached = true;

		}

	}

	/**
	 * Updates the resolution of all subpasses.
	 */

	private updateSubpassResolution(): void {

		const { baseWidth, baseHeight } = this.resolution;

		for(const pass of this.subpasses) {

			pass.resolution.setBaseSize(baseWidth, baseHeight);

		}

	}

	/**
	 * Updates the viewport of all subpasses.
	 */

	private updateSubpassViewport(): void {

		const { enabled, offsetX, offsetY, baseWidth, baseHeight } = this.viewport;

		for(const pass of this.subpasses) {

			pass.viewport.enabled = enabled;
			pass.viewport.setOffset(offsetX, offsetY);
			pass.viewport.setBaseSize(baseWidth, baseHeight);

		}

	}

	/**
	 * Updates the scissor of all subpasses.
	 */

	private updateSubpassScissor(): void {

		const { enabled, offsetX, offsetY, baseWidth, baseHeight } = this.scissor;

		for(const pass of this.subpasses) {

			pass.scissor.enabled = enabled;
			pass.scissor.setOffset(offsetX, offsetY);
			pass.scissor.setBaseSize(baseWidth, baseHeight);

		}

	}

	/**
	 * Updates the size of the default output buffer, if it exists.
	 */

	private updateOutputBufferSize(): void {

		this.output.defaultBuffer?.value?.setSize(this.resolution.width, this.resolution.height);

	}

	/**
	 * Updates the shader input data of the fullscreen material, if it exists.
	 */

	private updateFullscreenMaterialInput(): void {

		const fullscreenMaterial = this.fullscreenMaterial;

		if(!(fullscreenMaterial instanceof RawShaderMaterial ||
			fullscreenMaterial instanceof ShaderMaterial)) {

			// No defines or uniforms available.
			return;

		}

		if(fullscreenMaterial instanceof FullscreenMaterial) {

			fullscreenMaterial.inputBuffer = this.input.defaultBuffer?.value ?? null;

		} else {

			if(this.input.frameBufferPrecisionHigh) {

				fullscreenMaterial.defines.FRAME_BUFFER_PRECISION_HIGH = true;

			} else {

				delete fullscreenMaterial.defines.FRAME_BUFFER_PRECISION_HIGH;

			}

		}

		// Remove previous input defines and uniforms.

		for(const key of this.previousDefines.keys()) {

			delete fullscreenMaterial.defines[key];

		}

		for(const key of this.previousUniforms.keys()) {

			delete fullscreenMaterial.uniforms[key];

		}

		this.previousDefines.clear();
		this.previousUniforms.clear();

		// Add the new input defines and uniforms.

		for(const entry of this.input.defines) {

			this.previousDefines.set(entry[0], entry[1]);
			fullscreenMaterial.defines[entry[0]] = entry[1];

		}

		for(const entry of this.input.uniforms) {

			this.previousUniforms.set(entry[0], entry[1]);
			fullscreenMaterial.uniforms[entry[0]] = entry[1];

		}

		fullscreenMaterial.needsUpdate = true;

	}

	/**
	 * Updates the shader output data of the fullscreen material, if it exists.
	 */

	private updateFullscreenMaterialOutput(): void {

		const fullscreenMaterial = this.fullscreenMaterial;

		if(fullscreenMaterial instanceof FullscreenMaterial) {

			// High precision buffers use HalfFloatType (mediump).
			fullscreenMaterial.outputPrecision = this.output.frameBufferPrecisionHigh ? "mediump" : "lowp";

		}

	}

	/**
	 * Checks if this pass uses convolution shaders.
	 *
	 * Only works on passes that use a `FullscreenMaterial`.
	 *
	 * @param recursive - Controls whether subpasses should be checked recursively.
	 * @return True if the pass uses convolution shaders.
	 */

	isConvolutionPass(recursive: boolean): boolean {

		const material = this.fullscreenMaterial;

		if(material instanceof FullscreenMaterial && /texture\s*\(\s*gBuffer.color/.test(material.fragmentShader)) {

			return true;

		}

		if(recursive) {

			for(const subpass of this.subpasses) {

				if(subpass.isConvolutionPass(recursive)) {

					return true;

				}

			}

		}

		return false;

	}

	/**
	 * Checks if the current renderer supports all features that are required by this pass.
	 *
	 * Override this method to check if the current device supports the necessary features.
	 * This method should throw an error if the requirements are not met.
	 *
	 * @throws If the device doesn't meet the requirements.
	 * @param renderer - The current renderer.
	 */

	checkRequirements(renderer: WebGLRenderer): void {}

	/**
	 * Performs tasks when the input resources have changed.
	 *
	 * Override this empty method to handle input changes.
	 */

	protected onInputChange(): void {}

	/**
	 * Performs tasks when the output resources have changed.
	 *
	 * Override this empty method to handle output changes.
	 */

	protected onOutputChange(): void {}

	/**
	 * Performs tasks when the {@link resolution} has changed.
	 *
	 * Override this empty method to handle resolution changes.
	 */

	protected onResolutionChange(): void {}

	/**
	 * Performs tasks when the {@link viewport} has changed.
	 *
	 * Override this empty method to handle viewport changes.
	 */

	protected onViewportChange(): void {}

	/**
	 * Performs tasks when the {@link scissor} has changed.
	 *
	 * Override this empty method to handle scissor changes.
	 */

	protected onScissorChange(): void {}

	/**
	 * Creates a framebuffer.
	 *
	 * @return The framebuffer.
	 */

	protected createFramebuffer(): WebGLRenderTarget {

		const { width, height } = this.resolution;
		return new WebGLRenderTarget(width, height, { depthBuffer: false });

	}

	/**
	 * Dispatches a `change` event.
	 */

	protected setChanged(): void {

		this.dispatchEvent({ type: Pass.EVENT_CHANGE });

	}

	/**
	 * Applies the viewport of this pass to the current render target.
	 */

	protected applyViewport(): void {

		if(this.renderer === null) {

			return;

		}

		const renderTarget = this.renderer.getRenderTarget();
		const viewport = this.viewport;

		if(renderTarget === null) {

			if(viewport.enabled) {

				this.renderer.setViewport(viewport.x, viewport.y, viewport.z, viewport.w);

			} else {

				const { baseWidth, baseHeight } = this.resolution;
				this.renderer.setViewport(0, 0, baseWidth, baseHeight);

			}

		} else {

			if(viewport.enabled) {

				renderTarget.viewport.copy(viewport);

			} else {

				const { width, height } = renderTarget;
				renderTarget.viewport.set(0, 0, width, height);

			}

		}

	}

	/**
	 * Applies the scissor region of this pass to the current render target.
	 */

	protected applyScissor(): void {

		if(this.renderer === null) {

			return;

		}

		const renderTarget = this.renderer.getRenderTarget();
		const scissor = this.scissor;

		if(renderTarget === null) {

			if(scissor.enabled) {

				this.renderer.setScissor(scissor.x, scissor.y, scissor.z, scissor.w);
				this.renderer.setScissorTest(true);

			} else {

				const { baseWidth, baseHeight } = this.resolution;
				this.renderer.setScissor(0, 0, baseWidth, baseHeight);
				this.renderer.setScissorTest(false);

			}

		} else {

			if(scissor.enabled) {

				renderTarget.scissor.copy(scissor);
				renderTarget.scissorTest = true;

			} else {

				const { baseWidth, baseHeight } = this.resolution;
				renderTarget.scissor.set(0, 0, baseWidth, baseHeight);
				renderTarget.scissorTest = false;

			}

		}

	}

	/**
	 * Sets the active render target.
	 *
	 * This method also calls {@link applyViewport} and {@link applyScissor}.
	 *
	 * @param renderTarget - A render target. Use `null` to render to the canvas.
	 * @param activeCubeFace - The active cube side (PX 0, NX 1, PY 2, NY 3, PZ 4, NZ 5) of `WebGLCubeRenderTarget`.
	 * @param activeMipmapLevel - Specifies the active mipmap level.
	 */

	protected setRenderTarget(renderTarget: WebGLRenderTarget | WebGLRenderTarget<Texture[]> | null,
		activeCubeFace?: number, activeMipmapLevel?: number): void {

		this.renderer?.setRenderTarget(renderTarget, activeCubeFace, activeMipmapLevel);
		this.applyViewport();
		this.applyScissor();

	}

	/**
	 * Renders the fullscreen material to the current render target.
	 */

	protected renderFullscreen(): void {

		if(this.renderer !== null && this.fullscreenMaterial !== null) {

			this.renderer.render(this.fullscreenScene!, this.fullscreenCamera!);

		}

	}

	/**
	 * Handles {@link resolution} events.
	 *
	 * @param event - A resolution event.
	 */

	private handleResolutionEvent(event: Event): void {

		if(!this.attached) {

			return;

		}

		switch(event.type) {

			case "change":
				this.updateOutputBufferSize();
				this.onResolutionChange();
				this.updateSubpassResolution();
				break;

		}

	}

	/**
	 * Handles {@link viewport} events.
	 *
	 * @param event - A viewport event.
	 */

	private handleViewportEvent(event: Event): void {

		if(!this.attached) {

			return;

		}

		switch(event.type) {

			case "change":
				this.onViewportChange();
				this.updateSubpassViewport();
				break;

		}

	}

	/**
	 * Handles {@link scissor} events.
	 *
	 * @param event - A scissor event.
	 */

	private handleScissorEvent(event: Event): void {

		if(!this.attached) {

			return;

		}

		switch(event.type) {

			case "change":
				this.onScissorChange();
				this.updateSubpassScissor();
				break;

		}

	}

	/**
	 * Handles {@link input} events.
	 *
	 * @param event - An input event.
	 */

	private handleInputEvent(event: Event): void {

		if(!this.attached) {

			return;

		}

		switch(event.type) {

			case "change":
				this.updateFullscreenMaterialInput();
				this.onInputChange();
				break;

		}

	}

	/**
	 * Handles {@link output} events.
	 *
	 * @param event - An output event.
	 */

	private handleOutputEvent(event: Event): void {

		if(!this.attached) {

			return;

		}

		switch(event.type) {

			case "change":
				this.updateOutputBufferSize();
				this.updateFullscreenMaterialOutput();
				this.onOutputChange();
				break;

		}

	}

	dispose(): void {

		this.input.dispose();
		this.output.dispose();

		for(const disposable of this.disposables) {

			disposable.dispose();

		}

		for(const pass of this.subpasses) {

			pass.dispose();

		}

		this.fullscreenMaterial?.dispose();

		this.previousDefines.clear();
		this.previousUniforms.clear();

	}

	abstract render(): void;

}
