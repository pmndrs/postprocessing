import {
	BufferAttribute,
	BufferGeometry,
	Camera,
	EventDispatcher,
	Material,
	Mesh,
	OrthographicCamera,
	PerspectiveCamera,
	Scene,
	WebGLRenderer
} from "three";

import { ImmutableTimer } from "../utils/ImmutableTimer.js";
import { Log } from "../utils/Log.js";
import { Resolution } from "../utils/Resolution.js";
import { Disposable } from "./Disposable.js";
import { Input } from "./Input.js";
import { Output } from "./Output.js";
import { Renderable } from "./Renderable.js";

/**
 * An abstract pass.
 *
 * @group Core
 */

export abstract class Pass<T extends Material | null = null> extends EventDispatcher implements Disposable, Renderable {

	/**
	 * A shared fullscreen triangle.
	 *
	 * The screen size is 2x2 units (NDC). A triangle needs to be 4x4 units to fill the screen.
	 * @see https://michaldrobot.com/2014/04/01/gcn-execution-patterns-in-full-screen-passes/
	 */

	private static readonly fullscreenGeometry = (() => {

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

	/**
	 * @see {@link name}
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

		this.disposables = new Set<Disposable>();
		this.resolution = new Resolution();
		this.resolution.addEventListener("change", () => this.onResolutionChange(this.resolution));

		this.input = new Input();
		this.output = new Output();
		this.input.addEventListener("change", () => this.onInputChange());
		this.output.addEventListener("change", () => this.onOutputChange());

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
	 * A timer.
	 */

	get timer(): ImmutableTimer | null {

		return this._timer;

	}

	set timer(value: ImmutableTimer | null) {

		this._timer = value;

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

	}

	/**
	 * The main scene.
	 */

	get scene(): Scene | null { return null; }
	set scene(value: Scene | null) {}

	/**
	 * The main camera.
	 */

	get camera(): OrthographicCamera | PerspectiveCamera | null { return null; }
	set camera(value: OrthographicCamera | PerspectiveCamera | null) {}

	/**
	 * The current fullscreen material.
	 */

	get fullscreenMaterial(): T {

		return this.screen?.material as T;

	}

	protected set fullscreenMaterial(value: T) {

		if(this.screen !== null) {

			this.screen.material = value as Material;

		} else {

			this.screen = new Mesh(Pass.fullscreenGeometry, value as Material);
			this.screen.frustumCulled = false;
			this.fullscreenScene = new Scene();
			this.fullscreenCamera = new Camera();
			this.fullscreenScene.add(this.screen);

		}

	}

	/**
	 * Override this method to check if the current device supports specific features.
	 *
	 * If the requirements are not met, this method should throw an error.
	 *
	 * @param renderer - The current renderer.
	 * @throws If the device doesn't meet the requirements.
	 */

	checkRequirements(renderer: WebGLRenderer): void {}

	/**
	 * Override this method to handle input changes.
	 */

	protected onInputChange(): void {}

	/**
	 * Override this method to handle output changes.
	 */

	protected onOutputChange(): void {}

	/**
	 * Override this method to handle resolution changes.
	 *
	 * @param resolution - The resolution.
	 */

	protected onResolutionChange(resolution: Resolution): void {}

	/**
	 * Dispatches a `change` event.
	 */

	protected setChanged(): void {

		this.dispatchEvent({ type: "change" });

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

		this.fullscreenMaterial?.dispose();

	}

}
