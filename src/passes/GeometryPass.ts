import { OrthographicCamera, PerspectiveCamera, Scene, TextureDataType, UnsignedByteType } from "three";
import { Pass } from "../core/Pass.js";
import { Selective } from "../core/Selective.js";
import { Selection } from "../utils/Selection.js";
import { ClearPass } from "./ClearPass.js";

/**
 * GeometryPass constructor options.
 */

interface GeometryPassOptions {

	/**
	 * The type of the color buffer.
	 */

	frameBufferType?: TextureDataType;

	/**
	 * The amount of samples used for MSAA. Default is 0.
	 *
	 * Will be limited to the maximum value supported by the device.
	 */

	samples?: number;

}

/**
 * A geometry pass.
 */

export class GeometryPass extends Pass implements Selective {

	readonly selection: Selection;

	/**
	 * A clear pass.
	 */

	readonly clearPass: ClearPass;

	/**
	 * Indicates whether the scene background should be ignored.
	 */

	ignoreBackground: boolean;

	/**
	 * Indicates whether the shadow map auto update should be skipped.
	 */

	skipShadowMapUpdate: boolean;

	/**
	 * Constructs a new geometry pass.
	 *
	 * @param scene - The main scene.
	 * @param camera - The main camera.
	 * @param options - Additional options.
	 */

	constructor(scene: Scene, camera: OrthographicCamera | PerspectiveCamera, {
		frameBufferType = UnsignedByteType,
		samples = 0
	}: GeometryPassOptions = {}) {

		super("GeometryPass");

		this.scene = scene;
		this.camera = camera;

		this.clearPass = new ClearPass();
		this.ignoreBackground = false;
		this.skipShadowMapUpdate = false;
		this.selection = new Selection();
		this.selection.enabled = false;

	}

	render(): void {

		if(this.renderer === null || this.scene === null || this.camera === null) {

			return;

		}

		const selection = this.selection;
		const mask = this.camera.layers.mask;
		const background = this.scene.background;
		const shadowMapAutoUpdate = this.renderer.shadowMap.autoUpdate;

		if(this.selection.enabled) {

			this.camera.layers.set(selection.layer);

		}

		if(this.skipShadowMapUpdate) {

			this.renderer.shadowMap.autoUpdate = false;

		}

		if(this.ignoreBackground) { // || this.clearPass.clearColor.default !== null) {

			this.scene.background = null;

		}

		if(this.clearPass.enabled) {

			this.clearPass.render();

		}

		this.renderer.setRenderTarget(this.output.defaultBuffer);
		this.renderer.render(this.scene, this.camera);

		// Restore original values.
		this.camera.layers.mask = mask;
		this.scene.background = background;
		this.renderer.shadowMap.autoUpdate = shadowMapAutoUpdate;

	}

}
