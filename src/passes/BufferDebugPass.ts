import { Mesh, MeshBasicMaterial, OrthographicCamera, PlaneGeometry, Scene, Texture } from "three";
import { GBuffer } from "../enums/GBuffer.js";
import { Input } from "../core/Input.js";
import { Log } from "../utils/Log.js";
import { Resolution } from "../utils/Resolution.js";
import { CopyPass } from "./CopyPass.js";

/**
 * A debug pass that visualizes all input buffers.
 *
 * @category Passes
 */

export class BufferDebugPass extends CopyPass {

	/**
	 * The size of each texture view relative to the screen size.
	 *
	 * @defaultValue 0.1
	 */

	viewSize: number;

	/**
	 * Limits the amount of texture views per row.
	 *
	 * @defaultValue 4
	 */

	columns: number;

	/**
	 * @see {@link bufferFocus}
	 */

	private _bufferFocus: string | null;

	/**
	 * A list of meshes that are used to render the input textures.
	 */

	private views: Mesh[];

	/**
	 * A scene that contains the debug meshes.
	 */

	private debugScene: Scene;

	/**
	 * A debug camera.
	 */

	private debugCamera: OrthographicCamera;

	/**
	 * Constructs a new buffer debug pass.
	 *
	 * @param gBufferComponents - GBuffer components that should be rendered and visualized.
	 */

	constructor(gBufferComponents?: Set<GBuffer>) {

		super();

		this.name = "GBufferDebugPass";

		this.viewSize = 0.1;
		this.columns = 4;
		this.views = [];
		this._bufferFocus = null;
		this.debugScene = new Scene();
		this.debugCamera = new OrthographicCamera(-1, 1, 1, -1, 0, 1);

		if(gBufferComponents !== undefined) {

			for(const component of gBufferComponents) {

				this.input.gBuffer.add(component);

			}

		}

	}

	/**
	 * A buffer that should be rendered in fullscreen mode.
	 */

	get bufferFocus(): string | null {

		return this._bufferFocus;

	}

	set bufferFocus(value: string | null) {

		this._bufferFocus = value;

		if(value !== null && this.input.buffers.has(value)) {

			this.fullscreenMaterial.inputBuffer = this.input.buffers.get(value) as Texture;

		} else {

			this.fullscreenMaterial.inputBuffer = this.input.defaultBuffer;

		}

	}

	/**
	 * Updates the texture views.
	 */

	private updateViews(): void {

		const { width, height } = this.resolution;
		const size = Math.min(Math.max(this.viewSize, 0.0), 1.0);
		const columns = Math.max(this.columns, 0);
		const views = this.views;
		const rows = Math.ceil(views.length / columns);

		if(views.length * size > 1.0 || (views.length / rows) * size > 1.0) {

			Log.warn("Unable to fit texture views");
			return;

		}

		const sizeHalf = size * 0.5;
		const viewSizeX = size * width;
		const viewSizeY = size * height;

		const startX = width - sizeHalf * width;
		let offsetX = startX;
		let offsetY = sizeHalf * height;

		for(let i = 0, l = views.length, y = 0; y < rows; ++y) {

			for(let x = 0; x < columns && i < l; ++x, ++i) {

				const view = views[i];
				this.debugScene.add(view);
				view.scale.set(viewSizeX, viewSizeY, 1);
				view.position.set(offsetX, offsetY, 0);
				offsetX -= viewSizeX;

			}

			offsetX = startX;
			offsetY += viewSizeY;

		}

	}

	protected override onResolutionChange(resolution: Resolution): void {

		super.onResolutionChange(resolution);

		const { width, height } = resolution;
		const debugCamera = this.debugCamera;
		debugCamera.left = 0;
		debugCamera.right = width;
		debugCamera.top = height;
		debugCamera.bottom = 0;
		debugCamera.updateProjectionMatrix();

		this.updateViews();

	}

	protected override onInputChange(): void {

		super.onInputChange();

		for(const view of this.views) {

			view.geometry.dispose();
			this.debugScene.remove(view);

		}

		const capturedTextures = new WeakSet<Texture>();
		this.views = [];

		for(const entry of this.input.textures) {

			if(entry[0] === Input.BUFFER_DEFAULT || entry[1] === null || capturedTextures.has(entry[1])) {

				continue;

			}

			const view = new Mesh(
				new PlaneGeometry(),
				new MeshBasicMaterial({
					map: entry[1]
				})
			);

			view.name = entry[0];
			this.views.push(view);
			capturedTextures.add(entry[1]);

		}

		this.updateViews();

	}

	override render(): void {

		super.render();

		this.renderer?.render(this.debugScene, this.debugCamera);

	}

}
