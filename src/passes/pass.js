import THREE from "three";

/**
 * An abstract pass.
 *
 * This class implements a dispose method that frees memory on demand.
 * The EffectComposer calls this method when it is being destroyed.
 *
 * For this mechanism to work properly, please assign your render targets, 
 * materials or textures directly to your pass!
 *
 * You can prevent your disposable objects from being deleted by keeping them 
 * inside deeper structures such as arrays or objects.
 *
 * @class Pass
 * @constructor
 * @param {Scene} [scene] - The scene to render.
 * @param {Camera} [camera] - The camera will be added to the given scene if it has no parent.
 * @param {Mesh} [quad] - A quad that fills the screen. Used for rendering a pure 2D effect. Set this to null, if you don't need it (see RenderPass).
 */

export class Pass {

	constructor(scene, camera, quad) {

		/**
		 * The scene to render.
		 *
		 * @property scene
		 * @type Scene
		 * @private
		 * @default Scene()
		 */

		this.scene = (scene !== undefined) ? scene : new THREE.Scene();

		/**
		 * The camera to render with.
		 *
		 * @property camera
		 * @type Camera
		 * @private
		 * @default OrthographicCamera(-1, 1, 1, -1, 0, 1)
		 */

		this.camera = (camera !== undefined) ? camera : new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

		/**
		 * The quad mesh to use for rendering.
		 *
		 * Assign your shader material to this mesh!
		 *
		 * @property quad
		 * @type Mesh
		 * @private
		 * @default Mesh(PlaneBufferGeometry(2, 2), null)
		 * @example
		 *  this.quad.material = this.myMaterial;
		 */

		this.quad = (quad !== undefined) ? quad : new THREE.Mesh(new THREE.PlaneBufferGeometry(2, 2), null);

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

		// Finally, add the camera and the quad to the scene.
		if(this.scene !== null) {

			if(this.camera !== null && this.camera.parent === null) { this.scene.add(this.camera); }
			if(this.quad !== null) { this.scene.add(this.quad); }

		}

	}

	/**
	 * Renders the effect.
	 *
	 * This is an abstract method that must be overridden.
	 *
	 * @method render
	 * @throws {Error} An error is thrown if the method is not overridden.
	 * @param {WebGLRenderer} renderer - The renderer to use.
	 * @param {WebGLRenderTarget} readBuffer - A read buffer. Contains the result of the previous pass.
	 * @param {WebGLRenderTarget} writeBuffer - A write buffer. Normally used as the render target.
	 * @param {Number} [delta] - The delta time.
	 * @param {Boolean} [maskActive] - Indicates whether a stencil test mask is active or not.
	 */

	render(renderer, buffer, delta, maskActive) {

		throw new Error("Render method not implemented!");

	}

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
	 * The effect composer calls this method when this pass is first added.
	 *
	 * @method initialise
	 * @param {WebGLRenderer} renderer - The renderer.
	 * @param {Boolean} alpha - Whether the renderer uses the alpha channel or not.
	 */

	initialise(renderer, alpha) {}

	/**
	 * Updates this pass with the renderer's size.
	 *
	 * This is an abstract method that may be overriden in case you want to be 
	 * informed about the main render size.
	 *
	 * The effect composer calls this method when its own size is updated.
	 *
	 * @method setSize
	 * @param {Number} width - The renderer's width.
	 * @param {Number} height - The renderer's height.
	 * @example
	 *  this.myRenderTarget.setSize(width, height);
	 */

	setSize(width, height) {}

	/**
	 * Performs a shallow search for properties that define a dispose method and 
	 * deletes them. The pass will be inoperative after this method was called!
	 *
	 * Disposable objects:
	 *  - render targets
	 *  - materials
	 *  - textures
	 *
	 * The EffectComposer calls this method automatically when it is being
	 * destroyed. You may, however, use it independently to free memory 
	 * when you are certain that you don't need this pass anymore.
	 *
	 * @method dispose
	 */

	dispose() {

		let i, p;
		let keys = Object.keys(this);

		for(i = keys.length - 1; i >= 0; --i) {

			p = this[keys[i]];

			if(p !== null && typeof p.dispose === "function") {

				p.dispose();
				this[keys[i]] = null;

			}

		}

	}

}
