import {
	Camera,
	EventDispatcher,
	Group,
	Material,
	Mesh,
	Object3D,
	Scene,
	ShaderMaterial,
	Texture,
	Vector2,
	WebGLRenderer,
	WebGLRenderTarget
} from "three";

import { FullscreenMaterial } from "../materials/FullscreenMaterial.js";
import { GBufferSchema } from "../utils/gbuffer/GBufferSchema.js";
import { IdManager } from "../utils/IdManager.js";
import { ObservableSet } from "../utils/ObservableSet.js";
import { ReadonlyTimer } from "../utils/ReadonlyTimer.js";
import { Resolution } from "../utils/Resolution.js";
import { SceneEvent, SceneEventTarget } from "../utils/SceneEventTarget.js";
import { Scissor } from "../utils/Scissor.js";
import { ShaderDataTracker } from "../utils/ShaderDataTracker.js";
import { Viewport } from "../utils/Viewport.js";
import { fullscreenCamera } from "../utils/objects/fullscreenCamera.js";
import { fullscreenGeometry } from "../utils/objects/fullscreenGeometry.js";
import { Disposable } from "./Disposable.js";
import { RenderTask, RenderTaskEventMap } from "./RenderTask.js";
import { Input } from "./io/Input.js";
import { Output } from "./io/Output.js";

const v = /* @__PURE__ */ new Vector2();

/**
 * A pass.
 *
 * @category Core
 */

export abstract class Pass<TMaterial extends Material | null = null>
	extends EventDispatcher<RenderTaskEventMap> implements RenderTask {

	/**
	 * An ID manager.
	 */

	private static readonly idManager = /* @__PURE__ */ new IdManager();

	/**
	 * A container that keeps track of input shader data.
	 */

	private readonly shaderDataTracker: ShaderDataTracker;

	/**
	 * A listener for `childadded` events dispatched by the scene.
	 */

	private readonly sceneChildAddedListener: (event: SceneEvent) => void;

	/**
	 * A listener for `childremoved` events dispatched by the scene.
	 */

	private readonly sceneChildRemovedListener: (event: SceneEvent) => void;

	/**
	 * A scene that contains the fullscreen mesh.
	 */

	private fullscreenScene: Scene | null;

	/**
	 * A fullscreen mesh.
	 */

	private screen: Mesh | null;

	// #region Backing Data

	/**
	 * @see {@link Pass.prototype.name|name}
	 */

	private _name: string;

	/**
	 * @see {@link enabled}
	 */

	private _enabled: boolean;

	/**
	 * @see {@link timer}
	 */

	private _timer: ReadonlyTimer | null;

	/**
	 * @see {@link renderer}
	 */

	private _renderer: WebGLRenderer | null;

	// #region Internal

	/**
	 * @see {@link mainScene}
	 */

	private _mainScene: Scene | null;

	/**
	 * @see {@link mainCamera}
	 */

	private _mainCamera: Camera | null;

	/**
	 * @see {@link subtasks}
	 */

	private _subtasks: Pass<Material | null>[];

	// #endregion

	/**
	 * @see {@link scene}
	 */

	private _scene: Scene | null;

	/**
	 * @see {@link camera}
	 */

	private _camera: Camera | null;

	// #endregion

	readonly id: number;

	/**
	 * The input resources of this pass.
	 */

	readonly input: Input;

	/**
	 * The output resources of this pass.
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
	 * A collection of objects that will be disposed together with this pass.
	 */

	protected readonly disposables: Set<Disposable>;

	/**
	 * A collection of materials that are used by this pass.
	 *
	 * Materials set via {@link fullscreenMaterial} will be added/removed automatically.
	 */

	protected readonly materials: Set<Material>;

	/**
	 * Constructs a new pass.
	 *
	 * @param name - The name of this pass.
	 */

	constructor(name: string) {

		super();

		this.id = Pass.idManager.getNextId();
		this.shaderDataTracker = new ShaderDataTracker();
		this.fullscreenScene = null;
		this.screen = null;

		this.sceneChildAddedListener = (event) => this.onSceneChildAdded(event.child);
		this.sceneChildRemovedListener = (event) => this.onSceneChildRemoved(event.child);

		this._name = name;
		this._enabled = true;
		this._timer = null;
		this._renderer = null;
		this._mainScene = null;
		this._mainCamera = null;
		this._scene = null;
		this._camera = null;
		this._subtasks = [];

		this.input = new Input();
		this.output = new Output();
		this.resolution = new Resolution();
		this.viewport = new Viewport();
		this.scissor = new Scissor();
		this.disposables = new Set();

		const materials = new ObservableSet<Material>();
		this.materials = materials;

		// Update the viewport/scissor base size.
		this.resolution.addEventListener("change", () => this.updateViewportAndScissor());

		// Manage built-in fullscreen material data.
		materials.addEventListener("add", (e) => this.updateFullscreenMaterial(e.value));
		this.input.addEventListener("change", () => this.updateFullscreenMaterialsInput());
		this.output.addEventListener("change", () => this.updateFullscreenMaterialsOutput());
		this.resolution.addEventListener("change", () => this.updateFullscreenMaterialsResolution());

		// Synchronize subpasses.
		this.input.addEventListener("change", () => this.updateSubpassInput());
		this.resolution.addEventListener("change", () => this.updateSubpassResolution());
		this.viewport.addEventListener("change", () => this.updateSubpassViewport());
		this.scissor.addEventListener("change", () => this.updateSubpassScissor());

		// Wire up lifecycle hooks.
		this.input.addEventListener("change", () => this.onInputChange());
		this.output.addEventListener("change", () => this.onOutputChange());
		this.resolution.addEventListener("change", () => this.onResolutionChange());
		this.viewport.addEventListener("change", () => this.onViewportChange());
		this.scissor.addEventListener("change", () => this.onScissorChange());

	}

	// #region Accessors

	get name(): string {

		return this._name;

	}

	protected set name(value: string) {

		this._name = value;

	}

	get enabled(): boolean {

		return this._enabled;

	}

	set enabled(value: boolean) {

		if(this._enabled === value) {

			return;

		}

		this._enabled = value;
		this.dispatchEvent({ type: "toggle" });

	}

	get timer(): ReadonlyTimer | null {

		return this._timer;

	}

	set timer(value: ReadonlyTimer | null) {

		this._timer = value;

		for(const pass of this.subpasses) {

			pass.timer = value;

		}

	}

	get renderer(): WebGLRenderer | null {

		return this._renderer;

	}

	set renderer(value: WebGLRenderer | null) {

		this._renderer = value;

		try {

			if(value?.capabilities !== undefined) {

				this.checkRequirements();

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

	get scene(): Scene | null {

		return this._scene ?? this._mainScene;

	}

	set scene(value: Scene | null) {

		if(this._scene === value) {

			return;

		}

		this.removeSceneListeners();
		const previous = this.scene;
		this._scene = value;
		this.addSceneListeners();
		this.onSceneChange(previous, this.scene);

	}

	get camera(): Camera | null {

		return this._camera ?? this._mainCamera;

	}

	set camera(value: Camera | null) {

		if(this._camera === value) {

			return;

		}

		const previous = this.camera;
		this._camera = value;
		this.onCameraChange(previous, this.camera);

	}

	// #region Internal

	set gBufferSchema(value: GBufferSchema | null) {

		this.input.gBufferSchema = value;

		for(const subpass of this.subpasses) {

			subpass.gBufferSchema = value;

		}

	}

	set mainScene(value: Scene | null) {

		if(this._mainScene === value) {

			return;

		}

		this.removeSceneListeners();
		const previous = this.scene;
		this._mainScene = value;
		this.addSceneListeners();
		this.onSceneChange(previous, this.scene);

	}

	set mainCamera(value: Camera | null) {

		if(this._mainCamera === value) {

			return;

		}

		const previous = this.camera;
		this._mainCamera = value;
		this.onCameraChange(previous, this.camera);

	}

	get subtasks(): readonly RenderTask[] {

		return this._subtasks;

	}

	// #endregion

	/**
	 * A list of subpasses.
	 *
	 * Subpasses are considered part of this pass; they are included in automatic resource optimizations and will be
	 * disposed together with the parent pass.
	 *
	 * @see {@link renderSubpasses} for rendering subpasses.
	 */

	get subpasses(): readonly Pass<Material | null>[] {

		return this._subtasks;

	}

	protected set subpasses(value: Pass<Material | null>[]) {

		this._subtasks = value;
		Object.freeze(this._subtasks);
		this.initializeSubpasses();

	}

	/**
	 * The current fullscreen material.
	 */

	get fullscreenMaterial(): TMaterial {

		return this.screen?.material as TMaterial;

	}

	protected set fullscreenMaterial(value: TMaterial) {

		if(value === null) {

			return;

		}

		if(this.screen !== null) {

			this.screen.material = value;

		} else {

			this.screen = new Mesh(fullscreenGeometry, value);
			this.screen.frustumCulled = false;
			this.fullscreenScene = new Scene();
			this.fullscreenScene.add(this.screen);

		}

		this.materials.add(value);

	}

	// #endregion

	// #region Lifecycle Hooks

	/**
	 * Checks if the current renderer supports all the features that are required by this pass.
	 *
	 * This method should throw an error if the requirements are not met.
	 *
	 * @throws If the device doesn't meet the requirements.
	 */

	checkRequirements(): void {}

	/**
	 * Performs tasks when the input resources have changed.
	 */

	protected onInputChange(): void {}

	/**
	 * Performs tasks when the output resources have changed.
	 */

	protected onOutputChange(): void {}

	/**
	 * Performs tasks when the {@link resolution} has changed.
	 */

	protected onResolutionChange(): void {}

	/**
	 * Performs tasks when the {@link viewport} has changed.
	 */

	protected onViewportChange(): void {}

	/**
	 * Performs tasks when the {@link scissor} has changed.
	 */

	protected onScissorChange(): void {}

	/**
	 * Performs tasks when the {@link scene} has changed.
	 *
	 * @param previous - The previous scene.
	 * @param current - The new scene.
	 */

	protected onSceneChange(previous: Object3D | null, current: Object3D | null): void {}

	/**
	 * Performs tasks when a child node is added to the current {@link scene}.
	 *
	 * Note: This method will only be called for child nodes and not for the scene itself.
	 *
	 * @param object - The child node that was added.
	 */

	protected onSceneChildAdded(object: Object3D): void {}

	/**
	 * Performs tasks when a child node is removed from the current {@link scene}.
	 *
	 * Note: This method will only be called for child nodes and not for the scene itself.
	 *
	 * @param object - The child node that was removed.
	 */

	protected onSceneChildRemoved(object: Object3D): void {}

	/**
	 * Performs tasks when the {@link camera} has changed.
	 *
	 * @param previous - The previous camera.
	 * @param current - The new camera.
	 */

	protected onCameraChange(previous: Camera | null, current: Camera | null): void {}

	// #endregion

	// #region Subpasses

	private initializeSubpass(pass: Pass<Material | null>): void {

		pass.timer = this.timer;
		pass.renderer = this.renderer;

	}

	/**
	 * Sets the base settings of all subpasses.
	 */

	private initializeSubpasses(): void {

		for(const pass of this.subpasses) {

			this.initializeSubpass(pass);

		}

		this.updateSubpassResolution();
		this.updateSubpassViewport();
		this.updateSubpassScissor();

	}

	/**
	 * Updates the input resources of all subpasses.
	 */

	private updateSubpassInput(): void {

		for(const pass of this.subpasses) {

			pass.input.textures.clear();
			pass.input.connectRequiredTextures(this.input.textures);
			pass.input.shaderData.connect(this.input.shaderData);

		}

	}

	/**
	 * Updates the resolution of all subpasses.
	 */

	private updateSubpassResolution(): void {

		const { baseWidth, baseHeight, scaledPixelRatio } = this.resolution;

		for(const pass of this.subpasses) {

			// Use the scaled pixel ratio to keep the resolution scale of the subpasses intact.
			pass.resolution.pixelRatio = scaledPixelRatio;
			pass.resolution.setBaseSize(baseWidth, baseHeight);

		}

	}

	/**
	 * Updates the viewport of all subpasses.
	 */

	private updateSubpassViewport(): void {

		const { baseWidth, baseHeight, scaledPixelRatio } = this.viewport;

		for(const pass of this.subpasses) {

			// Use the scaled pixel ratio to keep the viewport scale of the subpasses intact.
			pass.viewport.pixelRatio = scaledPixelRatio;
			pass.viewport.setBaseSize(baseWidth, baseHeight);

		}

	}

	/**
	 * Updates the scissor of all subpasses.
	 */

	private updateSubpassScissor(): void {

		const { baseWidth, baseHeight, scaledPixelRatio } = this.scissor;

		for(const pass of this.subpasses) {

			// Use the scaled pixel ratio to keep the scissor scale of the subpasses intact.
			pass.scissor.pixelRatio = scaledPixelRatio;
			pass.scissor.setBaseSize(baseWidth, baseHeight);

		}

	}

	// #endregion

	// #region Materials

	/**
	 * Updates the size of the given material.
	 */

	private updateFullscreenMaterialResolution(material: Material | null): void {

		if(material instanceof FullscreenMaterial) {

			material.setSize(this.resolution.width, this.resolution.height);

		}

	}

	/**
	 * Updates the size of all fullscreen materials.
	 */

	private updateFullscreenMaterialsResolution(): void {

		for(const material of this.materials) {

			this.updateFullscreenMaterialResolution(material);

		}

	}

	/**
	 * Updates the shader input data of the given fullscreen material.
	 *
	 * @param material - The material to update.
	 */

	private updateFullscreenMaterialInput(material: Material | null): void {

		if(!(material instanceof ShaderMaterial)) {

			// No defines and uniforms available.
			return;

		}

		if(material instanceof FullscreenMaterial) {

			material.inputBuffer = this.input.defaultBuffer?.value ?? null;

		}

		this.shaderDataTracker
			.applyDefines(material, this.input.defines)
			.applyUniforms(material, this.input.uniforms);

	}

	/**
	 * Updates the shader input data of all fullscreen {@link materials}.
	 */

	private updateFullscreenMaterialsInput(): void {

		for(const material of this.materials) {

			this.updateFullscreenMaterialInput(material);

		}

		this.shaderDataTracker
			.trackDefines(this.input.defines)
			.trackUniforms(this.input.uniforms);

	}

	/**
	 * Updates the shader output settings of the given fullscreen material.
	 *
	 * @param material - The material to update.
	 */

	private updateFullscreenMaterialOutput(material: Material | null): void {

		if(material instanceof FullscreenMaterial) {

			// High precision buffers use HalfFloatType (mediump).
			material.outputPrecision = this.output.frameBufferPrecisionHigh ? "mediump" : "lowp";

		}

	}

	/**
	 * Updates the shader output settings of all fullscreen {@link materials}.
	 */

	private updateFullscreenMaterialsOutput(): void {

		for(const material of this.materials) {

			this.updateFullscreenMaterialOutput(material);

		}

	}

	/**
	 * Updates the given material's resolution and input/output data.
	 *
	 * @param material - The material to update.
	 */

	private updateFullscreenMaterial(material: Material | null): void {

		this.updateFullscreenMaterialResolution(material);
		this.updateFullscreenMaterialInput(material);
		this.updateFullscreenMaterialOutput(material);

	}

	// #endregion

	/**
	 * Registers scene child node listeners.
	 */

	private removeSceneListeners(): void {

		if(this.scene === null) {

			return;

		}

		const sceneEventTarget = SceneEventTarget.getInstance(this.scene);
		sceneEventTarget.removeEventListener("childadded", this.sceneChildAddedListener);
		sceneEventTarget.removeEventListener("childremoved", this.sceneChildRemovedListener);

	}

	/**
	 * Registers scene child node listeners.
	 */

	private addSceneListeners(): void {

		if(this.scene === null) {

			return;

		}

		const sceneEventTarget = SceneEventTarget.getInstance(this.scene);
		sceneEventTarget.addEventListener("childadded", this.sceneChildAddedListener);
		sceneEventTarget.addEventListener("childremoved", this.sceneChildRemovedListener);

	}

	/**
	 * Updates the viewport and scissor based on the current resolution.
	 */

	private updateViewportAndScissor(): void {

		const { baseWidth, baseHeight, scaledPixelRatio } = this.resolution;
		this.viewport.pixelRatio = scaledPixelRatio;
		this.viewport.setBaseSize(baseWidth, baseHeight);
		this.scissor.pixelRatio = scaledPixelRatio;
		this.scissor.setBaseSize(baseWidth, baseHeight);

	}

	/**
	 * Dispatches a `change` event.
	 */

	protected setChanged(): void {

		this.dispatchEvent({ type: "change" });

	}

	/**
	 * Applies the viewport of this pass to the given render target.
	 *
	 * Note: viewport/scissor on render targets use absolute pixels whereas the renderer expects logical pixels.
	 */

	protected applyViewport(renderTarget: WebGLRenderTarget | WebGLRenderTarget<Texture[]> | null = null): void {

		const renderer = this.renderer;

		if(renderer === null) {

			return;

		}

		const viewport = this.viewport;

		if(viewport.enabled) {

			if(renderTarget !== null) {

				renderTarget.viewport.copy(viewport);

			} else {

				renderer.setViewport(viewport.x, viewport.y, viewport.z, viewport.w);

			}

		} else {

			if(renderTarget !== null) {

				const { width, height } = renderTarget;
				renderTarget.viewport.set(0, 0, width, height);

			} else {

				const { width, height } = renderer.getSize(v);
				renderer.setViewport(0, 0, width, height);

			}

		}

	}

	/**
	 * Applies the scissor region of this pass to the given render target.
	 *
	 * Note: viewport/scissor on render targets use absolute pixels whereas the renderer expects logical pixels.
	 */

	protected applyScissor(renderTarget: WebGLRenderTarget | WebGLRenderTarget<Texture[]> | null = null): void {

		const renderer = this.renderer;

		if(renderer === null) {

			return;

		}

		const scissor = this.scissor;

		if(scissor.enabled) {

			if(renderTarget !== null) {

				renderTarget.scissor.copy(scissor);
				renderTarget.scissorTest = true;

			} else {

				renderer.setScissor(scissor.x, scissor.y, scissor.z, scissor.w);
				renderer.setScissorTest(true);

			}

		} else {

			if(renderTarget !== null) {

				const { width, height } = renderTarget;
				renderTarget.scissor.set(0, 0, width, height);
				renderTarget.scissorTest = false;

			} else if(renderer.getScissorTest()) {

				const { width, height } = renderer.getSize(v);
				renderer.setScissor(0, 0, width, height);
				renderer.setScissorTest(false);

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

	protected setRenderTarget(renderTarget: WebGLRenderTarget | WebGLRenderTarget<Texture[]> | null = null,
		activeCubeFace?: number, activeMipmapLevel?: number): void {

		// Viewport and scissor need to be set before setting the render target.
		this.applyViewport(renderTarget);
		this.applyScissor(renderTarget);
		this.renderer?.setRenderTarget(renderTarget, activeCubeFace, activeMipmapLevel);

	}

	/**
	 * Renders the subpasses in the order in which they were added.
	 */

	protected renderSubpasses(): void {

		for(const pass of this.subpasses) {

			if(pass.enabled) {

				pass.render();

			}

		}

	}

	/**
	 * Renders the fullscreen material to the current render target.
	 */

	protected renderFullscreen(): void {

		if(this.renderer !== null && this.fullscreenMaterial !== null) {

			this.renderer.render(this.fullscreenScene!, fullscreenCamera);

		}

	}

	async compile(): Promise<void> {

		if(this.renderer === null) {

			return;

		}

		const group = new Group();

		for(const material of this.materials) {

			group.add(new Mesh(fullscreenGeometry, material));

		}

		const promises: Promise<Object3D | void>[] = [
			this.renderer.compileAsync(group, fullscreenCamera, this.fullscreenScene)
		];

		for(const pass of this.subpasses) {

			promises.push(pass.compile());

		}

		await Promise.all(promises);

	}

	abstract render(): void;

	execute(): void {

		if(this.enabled) {

			this.render();

		}

	}

	dispose(): void {

		this.shaderDataTracker.dispose();

		for(const disposable of this.disposables) {

			disposable.dispose();

		}

		for(const material of this.materials) {

			material?.dispose();

		}

		for(const pass of this.subpasses) {

			pass.dispose();

		}

	}

}
