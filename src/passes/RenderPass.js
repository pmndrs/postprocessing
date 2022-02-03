import { OverrideMaterialManager } from "../core/OverrideMaterialManager";
import { ClearPass } from "./ClearPass";
import { Pass } from "./Pass";

/**
 * A pass that renders a given scene into the input buffer or to screen.
 *
 * This pass uses a {@link ClearPass} to clear the target buffer.
 */

export class RenderPass extends Pass {

	/**
	 * Constructs a new render pass.
	 *
	 * @param {Scene} scene - The scene to render.
	 * @param {Camera} camera - The camera to use to render the scene.
	 * @param {Material} [overrideMaterial=null] - An override material.
	 */

	constructor(scene, camera, overrideMaterial = null) {

		super("RenderPass", scene, camera);

		this.needsSwap = false;

		/**
		 * A clear pass.
		 *
		 * @type {ClearPass}
		 * @private
		 */

		this.clearPass = new ClearPass();

		/**
		 * An override material manager.
		 *
		 * @type {OverrideMaterialManager}
		 * @private
		 */

		this.overrideMaterialManager = (overrideMaterial === null) ? null : new OverrideMaterialManager(overrideMaterial);

		/**
		 * Indicates whether the scene background should be ignored.
		 *
		 * @type {Boolean}
		 * @private
		 */

		this.backgroundDisabled = false;

		/**
		 * Indicates whether the shadow map auto update should be skipped.
		 *
		 * @type {Boolean}
		 * @private
		 */

		this.shadowMapDisabled = false;

		/**
		 * A selection of objects to render.
		 *
		 * @type {Selection}
		 * @private
		 */

		this.selection = null;

	}

	/**
	 * Indicates whether this pass should render to screen.
	 *
	 * @type {Boolean}
	 */

	get renderToScreen() {

		return super.renderToScreen;

	}

	/**
	 * Sets the render to screen flag.
	 *
	 * @type {Boolean}
	 */

	set renderToScreen(value) {

		super.renderToScreen = value;
		this.clearPass.renderToScreen = value;

	}

	/**
	 * The current override material.
	 *
	 * @type {Material}
	 * @deprecated Use getOverrideMaterial() instead.
	 */

	get overrideMaterial() {

		return this.getOverrideMaterial();

	}

	/**
	 * Sets the override material.
	 *
	 * @type {Material}
	 * @deprecated Use setOverrideMaterial() instead.
	 */

	set overrideMaterial(value) {

		this.setOverrideMaterial(value);

	}

	/**
	 * Returns the current override material.
	 *
	 * @return {Material} The material.
	 */

	getOverrideMaterial() {

		const manager = this.overrideMaterialManager;
		return (manager !== null) ? manager.material : null;

	}

	/**
	 * Sets the override material.
	 *
	 * @type {Material}
	 * @return {Material} value - The material.
	 */

	setOverrideMaterial(value) {

		const manager = this.overrideMaterialManager;

		if(value !== null) {

			if(manager !== null) {

				manager.setMaterial(value);

			} else {

				this.overrideMaterialManager = new OverrideMaterialManager(value);

			}

		} else if(manager !== null) {

			manager.dispose();
			this.overrideMaterialManager = null;

		}

	}

	/**
	 * Indicates whether the target buffer should be cleared before rendering.
	 *
	 * @type {Boolean}
	 * @deprecated Use getClearPass().isEnabled() instead.
	 */

	get clear() {

		return this.clearPass.isEnabled();

	}

	/**
	 * Enables or disables auto clear.
	 *
	 * @type {Boolean}
	 * @deprecated Use getClearPass().setEnabled() instead.
	 */

	set clear(value) {

		this.clearPass.setEnabled(value);

	}

	/**
	 * Returns the selection. Default is `null` (no restriction).
	 *
	 * @return {Selection} The selection.
	 */

	getSelection() {

		return this.selection;

	}

	/**
	 * Sets the selection. Set to `null` to disable.
	 *
	 * @param {Selection} selection - The selection.
	 */

	setSelection(selection) {

		this.selection = selection;

	}

	/**
	 * Indicates whether the scene background is disabled.
	 *
	 * @return {Boolean} Whether the scene background is disabled.
	 */

	isBackgroundDisabled() {

		return this.backgroundDisabled;

	}

	/**
	 * Enables or disables the scene background.
	 *
	 * @param {Boolean} disabled - Whether the scene background should be disabled.
	 */

	setBackgroundDisabled(disabled) {

		this.backgroundDisabled = disabled;

	}

	/**
	 * Indicates whether the shadow map auto update is disabled.
	 *
	 * @return {Boolean} Whether the shadow map update is disabled.
	 */

	isShadowMapDisabled() {

		return this.shadowMapDisabled;

	}

	/**
	 * Enables or disables the shadow map auto update.
	 *
	 * @param {Boolean} disabled - Whether the shadow map auto update should be disabled.
	 */

	setShadowMapDisabled(disabled) {

		this.shadowMapDisabled = disabled;

	}

	/**
	 * Returns the clear pass.
	 *
	 * @return {ClearPass} The clear pass.
	 */

	getClearPass() {

		return this.clearPass;

	}

	/**
	 * Renders the scene.
	 *
	 * @param {WebGLRenderer} renderer - The renderer.
	 * @param {WebGLRenderTarget} inputBuffer - A frame buffer that contains the result of the previous pass.
	 * @param {WebGLRenderTarget} outputBuffer - A frame buffer that serves as the output render target unless this pass renders to screen.
	 * @param {Number} [deltaTime] - The time between the last frame and the current one in seconds.
	 * @param {Boolean} [stencilTest] - Indicates whether a stencil mask is active.
	 */

	render(renderer, inputBuffer, outputBuffer, deltaTime, stencilTest) {

		const scene = this.scene;
		const camera = this.camera;
		const selection = this.selection;
		const mask = camera.layers.mask;
		const background = scene.background;
		const shadowMapAutoUpdate = renderer.shadowMap.autoUpdate;
		const renderTarget = this.renderToScreen ? null : inputBuffer;

		if(selection !== null) {

			camera.layers.set(selection.getLayer());

		}

		if(this.shadowMapDisabled) {

			renderer.shadowMap.autoUpdate = false;

		}

		if(this.backgroundDisabled || this.clearPass.overrideClearColor !== null) {

			scene.background = null;

		}

		if(this.clearPass.isEnabled()) {

			this.clearPass.render(renderer, inputBuffer);

		}

		renderer.setRenderTarget(renderTarget);

		if(this.overrideMaterialManager !== null) {

			this.overrideMaterialManager.render(renderer, scene, camera);

		} else {

			renderer.render(scene, camera);

		}

		// Restore original values.
		camera.layers.mask = mask;
		scene.background = background;
		renderer.shadowMap.autoUpdate = shadowMapAutoUpdate;

	}

}
