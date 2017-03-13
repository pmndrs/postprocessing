import { Scene, Mesh, OrthographicCamera, PlaneBufferGeometry } from "three";

/**
 * An abstract pass.
 *
 * Passes that do not rely on the depth buffer should explicitly disable the
 * depth test and depth write in their respective shader materials.
 *
 * This class implements a {{#crossLink "Pass/dispose:method"}}{{/crossLink}}
 * method that frees memory on demand.
 *
 * @class Pass
 * @submodule passes
 * @constructor
 * @param {Scene} [scene] - The scene to render.
 * @param {Camera} [camera] - The camera will be added to the given scene if it has no parent.
 * @param {Mesh} [quad] - A quad that fills the screen to render 2D filter effects. Set this to null, if you don't need it (see {{#crossLink "RenderPass"}}{{/crossLink}}).
 */

export class Pass {

	constructor(
		scene = new Scene(),
		camera = new OrthographicCamera(-1, 1, 1, -1, 0, 1),
		quad = new Mesh(new PlaneBufferGeometry(2, 2), null)
	) {

		/**
		 * The name of this pass.
		 *
		 * @property name
		 * @type String
		 */

		this.name = "Pass";

		/**
		 * The scene to render.
		 *
		 * @property scene
		 * @type Scene
		 * @private
		 * @default new Scene()
		 */

		this.scene = scene;

		/**
		 * The camera.
		 *
		 * @property camera
		 * @type Camera
		 * @private
		 * @default new OrthographicCamera(-1, 1, 1, -1, 0, 1)
		 */

		this.camera = camera;

		/**
		 * A quad mesh that fills the screen.
		 *
		 * Assign your shader material to this mesh!
		 *
		 * @property quad
		 * @type Mesh
		 * @private
		 * @default new Mesh(new PlaneBufferGeometry(2, 2), null)
		 * @example
		 *     this.quad.material = this.myMaterial;
		 */

		this.quad = quad;

		if(this.quad !== null) {

			this.quad.frustumCulled = false;

		}

		/**
		 * Indicates whether the read and write buffers should be swapped after this
		 * pass has finished rendering.
		 *
		 * Set this to true if this pass renders to the write buffer so that a
		 * following pass can find the result in the read buffer.
		 *
		 * @property needsSwap
		 * @type Boolean
		 * @private
		 * @default false
		 */

		this.needsSwap = false;

		/**
		 * Enabled flag.
		 *
		 * @property enabled
		 * @type Boolean
		 * @default true
		 */

		this.enabled = true;

		/**
		 * Render to screen flag.
		 *
		 * @property renderToScreen
		 * @type Boolean
		 * @default false
		 */

		this.renderToScreen = false;

		// Add the camera and the quad to the scene.
		if(this.scene !== null) {

			if(this.camera !== null && this.camera.parent === null) {

				this.scene.add(this.camera);

			}

			if(this.quad !== null) {

				this.scene.add(this.quad);

			}

		}

	}

	/**
	 * Renders the effect.
	 *
	 * This is an abstract method that must be overridden.
	 *
	 * @method render
	 * @throws {Error} An error is thrown if the method is not overridden.
	 * @param {WebGLRenderer} renderer - The renderer.
	 * @param {WebGLRenderTarget} readBuffer - A read buffer. Contains the result of the previous pass.
	 * @param {WebGLRenderTarget} writeBuffer - A write buffer. Normally used as the render target when the read buffer is used as input.
	 * @param {Number} [delta] - The delta time.
	 * @param {Boolean} [maskActive] - Indicates whether a stencil test mask is active or not.
	 */

	render(renderer, readBuffer, writeBuffer, delta, maskActive) {

		throw new Error("Render method not implemented!");

	}

	/**
	 * Updates this pass with the renderer's size.
	 *
	 * This is an abstract method that may be overridden in case you want to be
	 * informed about the main render size.
	 *
	 * The {{#crossLink "EffectComposer"}}{{/crossLink}} calls this method before
	 * this pass is initialised and every time its own size is updated.
	 *
	 * @method setSize
	 * @param {Number} width - The renderer's width.
	 * @param {Number} height - The renderer's height.
	 * @example
	 *     this.myRenderTarget.setSize(width, height);
	 */

	setSize(width, height) {}

	/**
	 * Performs initialisation tasks.
	 *
	 * By implementing this abstract method you gain access to the renderer.
	 * You'll also be able to configure your custom render targets to use the
	 * appropriate format (RGB or RGBA).
	 *
	 * The provided renderer can be used to warm up special off-screen render
	 * targets by performing a preliminary render operation.
	 *
	 * The {{#crossLink "EffectComposer"}}{{/crossLink}} calls this method when
	 * this pass is added to its queue.
	 *
	 * @method initialise
	 * @param {WebGLRenderer} renderer - The renderer.
	 * @param {Boolean} alpha - Whether the renderer uses the alpha channel or not.
	 * @example
	 *     if(!alpha) { this.myRenderTarget.texture.format = RGBFormat; }
	 */

	initialise(renderer, alpha) {}

	/**
	 * Performs a shallow search for properties that define a dispose method and
	 * deletes them. The pass will be inoperative after this method was called!
	 *
	 * Disposable objects:
	 *  - render targets
	 *  - materials
	 *  - textures
	 *
	 * The {{#crossLink "EffectComposer"}}{{/crossLink}} calls this method when it
	 * is being destroyed. You may, however, use it independently to free memory
	 * when you are certain that you don't need this pass anymore.
	 *
	 * @method dispose
	 */

	dispose() {

		const keys = Object.keys(this);

		let key;

		for(key of keys) {

			if(this[key] !== null && typeof this[key].dispose === "function") {

				this[key].dispose();
				this[key] = null;

			}

		}

	}

}
