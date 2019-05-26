import {
	BufferAttribute,
	BufferGeometry,
	Scene,
	Mesh,
	OrthographicCamera
} from "three";

/**
 * Shared fullscreen geometry.
 *
 * @type {BufferGeometry}
 * @private
 */

let geometry = null;

/**
 * Returns a shared fullscreen triangle.
 *
 * The size of the screen is 2x2 units (NDC). A triangle that fills the screen
 * needs to be 4 units wide and 4 units tall.
 *
 * @private
 * @return {BufferGeometry} The fullscreen geometry.
 */

function getFullscreenTriangle() {

	if(geometry === null) {

		const vertices = new Float32Array([-1, -1, 0, 3, -1, 0, -1, 3, 0]);
		const uvs = new Float32Array([0, 0, 2, 0, 0, 2]);
		geometry = new BufferGeometry();
		geometry.addAttribute("position", new BufferAttribute(vertices, 3));
		geometry.addAttribute("uv", new BufferAttribute(uvs, 2));

	}

	return geometry;

}

/**
 * An abstract pass.
 *
 * Passes that do not rely on the depth buffer should explicitly disable the
 * depth test and depth write flags of their fullscreen shader material.
 *
 * Fullscreen passes use a shared fullscreen triangle:
 * https://michaldrobot.com/2014/04/01/gcn-execution-patterns-in-full-screen-passes/
 *
 * @implements {Initializable}
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
		 * A mesh that fills the screen.
		 *
		 * @type {Mesh}
		 * @private
		 */

		this.screen = null;

		/**
		 * Only relevant for subclassing.
		 *
		 * Indicates whether the {@link EffectComposer} should swap the frame
		 * buffers after this pass has finished rendering.
		 *
		 * Set this to `false` if this pass doesn't render to the output buffer or
		 * the screen. Otherwise, the contents of the input buffer will be lost.
		 *
		 * @type {Boolean}
		 */

		this.needsSwap = true;

		/**
		 * Only relevant for subclassing.
		 *
		 * Indicates whether the {@link EffectComposer} should prepare a depth
		 * texture for this pass.
		 *
		 * Set this to `true` if this pass relies on depth information from a
		 * preceding {@link RenderPass}.
		 *
		 * @type {Boolean}
		 */

		this.needsDepthTexture = false;

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

	}

	/**
	 * Returns the current fullscreen material.
	 *
	 * @return {Material} The current fullscreen material, or null if there is none.
	 */

	getFullscreenMaterial() {

		return (this.screen !== null) ? this.screen.material : null;

	}

	/**
	 * Sets the fullscreen material.
	 *
	 * The material will be assigned to a mesh that fills the screen. The mesh
	 * will be created once a material is assigned via this method.
	 *
	 * @protected
	 * @param {Material} material - A fullscreen material.
	 */

	setFullscreenMaterial(material) {

		let screen = this.screen;

		if(screen !== null) {

			screen.material = material;

		} else {

			screen = new Mesh(getFullscreenTriangle(), material);
			screen.frustumCulled = false;

			if(this.scene === null) {

				this.scene = new Scene();

			}

			this.scene.add(screen);
			this.screen = screen;

		}

	}

	/**
	 * Returns the current depth texture.
	 *
	 * @return {Texture} The current depth texture, or null if there is none.
	 */

	getDepthTexture() {

		return null;

	}

	/**
	 * Sets the depth texture.
	 *
	 * You may override this method if your pass relies on the depth information
	 * of a preceding {@link RenderPass}.
	 *
	 * @param {Texture} depthTexture - A depth texture.
	 * @param {Number} [depthPacking=0] - The depth packing.
	 */

	setDepthTexture(depthTexture, depthPacking = 0) {}

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
	 * @param {Number} [deltaTime] - The time between the last frame and the current one in seconds.
	 * @param {Boolean} [stencilTest] - Indicates whether a stencil mask is active.
	 */

	render(renderer, inputBuffer, outputBuffer, deltaTime, stencilTest) {

		throw new Error("Render method not implemented!");

	}

	/**
	 * Updates this pass with the renderer's size.
	 *
	 * You may override this method in case you want to be informed about the size
	 * of the main frame buffer.
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

				/** @ignore */
				this[key].dispose();

			}

		}

	}

}
