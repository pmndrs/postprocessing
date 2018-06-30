import { Scene, Mesh, OrthographicCamera, PlaneBufferGeometry } from "three";

/**
 * An abstract pass.
 *
 * Passes that do not rely on the depth buffer should explicitly disable the
 * depth test and depth write in their respective shader materials.
 *
 * @implements {Resizable}
 * @implements {Disposable}
 */

export class Pass {

	/**
	 * Constructs a new pass.
	 *
	 * @param {String} [name] - The name of this pass. Does not have to be unique.
	 * @param {Scene} [scene] - The scene to render. The default scene contains a single mesh that fills the screen.
	 * @param {Camera} [camera] - The camera. The default camera perfectly captures the screen mesh.
	 */

	constructor(name = "Pass", scene = new Scene(), camera = new OrthographicCamera(-1, 1, 1, -1, 0, 1)) {

		/**
		 * The name of this pass.
		 *
		 * @type {String}
		 */

		this.name = name;

		/**
		 * The scene to render.
		 *
		 * @type {Scene}
		 * @protected
		 */

		this.scene = scene;

		/**
		 * The camera.
		 *
		 * @type {Camera}
		 * @protected
		 */

		this.camera = camera;

		/**
		 * A quad mesh that fills the screen.
		 *
		 * @type {Mesh}
		 * @private
		 */

		this.quad = null;

		/**
		 * Indicates whether this pass should render to screen.
		 *
		 * @type {Boolean}
		 */

		this.renderToScreen = false;

		/**
		 * Indicates whether this pass should be executed.
		 *
		 * @type {Boolean}
		 */

		this.enabled = true;

		/**
		 * Indicates whether the {@link EffectComposer} should swap the frame
		 * buffers after this pass has finished rendering.
		 *
		 * Set this to `false` if this pass doesn't render to the output buffer or
		 * the screen. Otherwise, the contents of the input buffer will be lost.
		 *
		 * @type {Boolean}
		 */

		this.needsSwap = true;

	}

	/**
	 * The fullscreen material.
	 *
	 * @type {Material}
	 * @deprecated Use getFullscreenMaterial() instead.
	 */

	get material() {

		console.warn("Pass.material has been deprecated, please use Pass.getFullscreenMaterial()");

		return this.getFullscreenMaterial();

	}

	/**
	 * @protected
	 * @type {Material}
	 * @deprecated Use setFullscreenMaterial(Material) instead.
	 */

	set material(value) {

		console.warn("Pass.material has been deprecated, please use Pass.setFullscreenMaterial(Material)");

		this.setFullscreenMaterial(value);

	}

	/**
	 * Returns the current fullscreen material.
	 *
	 * @return {Material} The current fullscreen material, or null if there is none.
	 */

	getFullscreenMaterial() {

		return (this.quad !== null) ? this.quad.material : null;

	}

	/**
	 * Sets the fullscreen material.
	 *
	 * The material will be assigned to the quad mesh that fills the screen. The
	 * screen quad will be created once a material is assigned via this method.
	 *
	 * @protected
	 * @param {Material} material - A fullscreen material.
	 */

	setFullscreenMaterial(material) {

		let quad = this.quad;

		if(quad !== null) {

			quad.material = material;

		} else {

			quad = new Mesh(new PlaneBufferGeometry(2, 2), material);
			quad.frustumCulled = false;

			if(this.scene !== null) {

				this.scene.add(quad);
				this.quad = quad;

			}

		}

	}

	/**
	 * Renders the effect.
	 *
	 * This is an abstract method that must be overridden.
	 *
	 * @abstract
	 * @throws {Error} An error is thrown if the method is not overridden.
	 * @param {WebGLRenderer} renderer - The renderer.
	 * @param {WebGLRenderTarget} inputBuffer - A frame buffer that contains the result of the previous pass.
	 * @param {WebGLRenderTarget} outputBuffer - A frame buffer that serves as the output render target unless this pass renders to screen.
	 * @param {Number} [delta] - The time between the last frame and the current one in seconds.
	 * @param {Boolean} [stencilTest] - Indicates whether a stencil mask is active.
	 */

	render(renderer, inputBuffer, outputBuffer, delta, stencilTest) {

		throw new Error("Render method not implemented!");

	}

	/**
	 * Updates this pass with the renderer's size.
	 *
	 * You may override this method in case you want to be informed about the main
	 * render size.
	 *
	 * The {@link EffectComposer} calls this method before this pass is
	 * initialized and every time its own size is updated.
	 *
	 * @param {Number} width - The renderer's width.
	 * @param {Number} height - The renderer's height.
	 * @example this.myRenderTarget.setSize(width, height);
	 */

	setSize(width, height) {}

	/**
	 * Performs initialization tasks.
	 *
	 * By overriding this method you gain access to the renderer. You'll also be
	 * able to configure your custom render targets to use the appropriate format
	 * (RGB or RGBA).
	 *
	 * The provided renderer can be used to warm up special off-screen render
	 * targets by performing a preliminary render operation.
	 *
	 * The {@link EffectComposer} calls this method when this pass is added to its
	 * queue, but not before its size has been set.
	 *
	 * @param {WebGLRenderer} renderer - The renderer.
	 * @param {Boolean} alpha - Whether the renderer uses the alpha channel or not.
	 * @example if(!alpha) { this.myRenderTarget.texture.format = RGBFormat; }
	 */

	initialize(renderer, alpha) {}

	/**
	 * Performs a shallow search for disposable properties and deletes them. The
	 * pass will be inoperative after this method was called!
	 *
	 * Disposable objects:
	 *  - WebGLRenderTarget
	 *  - Material
	 *  - Texture
	 *
	 * The {@link EffectComposer} calls this method when it is being destroyed.
	 * You may, however, use it independently to free memory when you are certain
	 * that you don't need this pass anymore.
	 */

	dispose() {

		const material = this.getFullscreenMaterial();

		if(material !== null) {

			material.dispose();

		}

		for(const key of Object.keys(this)) {

			if(this[key] !== null && typeof this[key].dispose === "function") {

				this[key].dispose();
				this[key] = null;

			}

		}

	}

}
