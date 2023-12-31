import {
	BufferAttribute,
	BufferGeometry,
	Camera,
	EventDispatcher,
	Material,
	Mesh,
	OrthographicCamera,
	PerspectiveCamera,
	RawShaderMaterial,
	Scene,
	ShaderMaterial,
	WebGLRenderer
} from "three";

import { FullscreenMaterial } from "../materials/FullscreenMaterial.js";
import { ImmutableTimer } from "../utils/ImmutableTimer.js";
import { Log } from "../utils/Log.js";
import { Resolution } from "../utils/Resolution.js";
import { BaseEventMap } from "./BaseEventMap.js";
import { Disposable } from "./Disposable.js";
import { Input } from "./Input.js";
import { Output } from "./Output.js";
import { Renderable } from "./Renderable.js";

/**
 * An abstract pass.
 *
 * @group Core
 */

export abstract class Pass<TMaterial extends Material | null = null>
	extends EventDispatcher<BaseEventMap> implements Disposable, Renderable {

	/**
	 * Triggers when this pass has changed and requires a full update.
	 *
	 * @event
	 */

	static readonly EVENT_CHANGE = "change";

	/**
	 * A shared fullscreen triangle.
	 *
	 * The screen size is 2x2 units (NDC). A triangle needs to be 4x4 units to fill the screen.
	 * @see https://michaldrobot.com/2014/04/01/gcn-execution-patterns-in-full-screen-passes/
	 */

	private static readonly fullscreenGeometry = /* @__PURE__ */ (() => {

		const vertices = new Float32Array([-1, -1, 0, 3, -1, 0, -1, 3, 0]);
		const geometry = new BufferGeometry();
		geometry.setAttribute("position", new BufferAttribute(vertices, 3));
		return geometry;

	})();

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
	 * @see {@link renderer}
	 */

	private _renderer: WebGLRenderer | null;

	/**
	 * @see {@link timer}
	 */

	private _timer: ImmutableTimer | null;

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
	 * IO resources will be disposed separately.
	 */

	protected readonly disposables: Set<Disposable>;

	/**
	 * The current resolution.
	 */

	readonly resolution: Resolution;

	/**
	 * The input resources of this pass.
	 */

	readonly input: Input;

	/**
	 * The output resources of this pass.
	 */

	readonly output: Output;

	/**
	 * Indicates whether this pass is enabled.
	 */

	enabled: boolean;

	/**
	 * Constructs a new pass.
	 *
	 * @param name - A name that will be used for debugging purposes. Doesn't have to be unique.
	 */

	constructor(name: string) {

		super();

		this.fullscreenScene = null;
		this.fullscreenCamera = null;
		this.screen = null;

		this._name = name;
		this._renderer = null;
		this._timer = null;
		this._scene = null;
		this._camera = null;

		this.disposables = new Set<Disposable>();
		this.resolution = new Resolution();
		this.resolution.addEventListener(Resolution.EVENT_CHANGE, () => this.onResolutionChange(this.resolution));

		this.input = new Input();
		this.output = new Output();
		this.input.addEventListener(Input.EVENT_CHANGE, () => this.updateFullscreenMaterial());
		this.input.addEventListener(Input.EVENT_CHANGE, () => this.onInputChange());
		this.output.addEventListener(Output.EVENT_CHANGE, () => this.onOutputChange());

		this._subpasses = [];
		this.enabled = true;

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
	 * A list of subpasses.
	 *
	 * Subpasses are subject to automatic resource optimizations.
	 */

	get subpasses(): ReadonlyArray<Pass<Material | null>> {

		return this._subpasses;

	}

	protected set subpasses(value: Pass<Material | null>[]) {

		this._subpasses = value;

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

			if(value !== null && value.capabilities !== undefined) {

				this.checkRequirements(value);

			}

		} catch(e) {

			Log.warn(e);
			Log.info("Disabling pass:", this);
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

			this.screen.material = value as Material;

		} else {

			this.screen = new Mesh(Pass.fullscreenGeometry, value as Material);
			this.screen.frustumCulled = false;
			this.fullscreenScene = new Scene();
			this.fullscreenCamera = new OrthographicCamera(-1, 1, 1, -1, 0, 1);
			this.fullscreenScene.add(this.screen);

		}

	}

	/**
	 * Updates the shader input data of the fullscreen material, if it exists.
	 */

	private updateFullscreenMaterial(): void {

		const fullscreenMaterial = this.fullscreenMaterial;

		if(!(fullscreenMaterial instanceof RawShaderMaterial ||
			fullscreenMaterial instanceof ShaderMaterial)) {

			// No defines or uniforms available.
			return;

		}

		if(fullscreenMaterial instanceof FullscreenMaterial) {

			fullscreenMaterial.inputBuffer = this.input.defaultBuffer;

		}

		if(this.input.frameBufferPrecisionHigh) {

			fullscreenMaterial.defines.FRAME_BUFFER_PRECISION_HIGH = true;

		} else {

			delete fullscreenMaterial.defines.FRAME_BUFFER_PRECISION_HIGH;

		}

		for(const entry of this.input.defines) {

			fullscreenMaterial.defines[entry[0]] = entry[1];

		}

		for(const entry of this.input.uniforms) {

			fullscreenMaterial.uniforms[entry[0]] = entry[1];

		}

		fullscreenMaterial.needsUpdate = true;

	}

	/**
	 * Checks if his pass uses convolution shaders.
	 *
	 * Only works on passes that use `FullscreenMaterial`.
	 *
	 * @param recursive - Controls whether subpasses should be checked recursively.
	 * @return True if the pass uses convolution shaders.
	 */

	isConvolutionPass(recursive: boolean): boolean {

		const material = this.fullscreenMaterial;

		if(material instanceof FullscreenMaterial && /texture\s*\(\s*inputBuffer/.test(material.fragmentShader)) {

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
	 * @param renderer - The current renderer.
	 * @throws If the device doesn't meet the requirements.
	 */

	checkRequirements(renderer: WebGLRenderer): void {}

	/**
	 * Performs tasks when the input resources have changed.
	 *
	 * Override this method to handle input changes.
	 */

	protected onInputChange(): void {}

	/**
	 * Performs tasks when the output resources have changed.
	 *
	 * Override this method to handle output changes.
	 */

	protected onOutputChange(): void {}

	/**
	 * Performs tasks when the resolution has changed.
	 *
	 * Override this method to handle resolution changes.
	 *
	 * @param resolution - The updated resolution of this pass.
	 */

	protected onResolutionChange(resolution: Resolution): void {}

	/**
	 * Dispatches a `change` event.
	 */

	protected setChanged(): void {

		this.dispatchEvent({ type: Pass.EVENT_CHANGE });

	}

	/**
	 * Renders the fullscreen material to the current render target.
	 */

	protected renderFullscreen(): void {

		if(this.renderer !== null && this.fullscreenMaterial !== null) {

			this.renderer.render(this.fullscreenScene as Scene, this.fullscreenCamera as Camera);

		}

	}

	abstract render(): void;

	dispose(): void {

		for(const disposable of this.disposables) {

			disposable.dispose();

		}

		for(const pass of this.subpasses) {

			pass.dispose();

		}

		this.fullscreenMaterial?.dispose();

	}

}
