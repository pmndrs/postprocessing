import {
	BasicDepthPacking,
	BufferAttribute,
	BufferGeometry,
	Camera,
	Material,
	Mesh,
	Scene,
	Texture,
	WebGLRenderTarget
} from "three";

const fullscreenGeometry = /* @__PURE__ */ (() => {

	const vertices = new Float32Array([-1, -1, 0, 3, -1, 0, -1, 3, 0]);
	const uvs = new Float32Array([0, 0, 2, 0, 0, 2]);
	const geometry = new BufferGeometry();
	geometry.setAttribute("position", new BufferAttribute(vertices, 3));
	geometry.setAttribute("uv", new BufferAttribute(uvs, 2));
	return geometry;

})();

/**
 * An abstract pass.
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
	 * A shared fullscreen triangle.
	 *
	 * The screen size is 2x2 units (NDC). A triangle needs to be 4x4 units to fill the screen.
	 * @see https://michaldrobot.com/2014/04/01/gcn-execution-patterns-in-full-screen-passes/
	 * @type {BufferGeometry}
	 * @internal
	 */

	static get fullscreenGeometry() {

		return fullscreenGeometry;

	}

	/**
	 * Constructs a new pass.
	 *
	 * @param {String} [name] - The name of this pass. Does not have to be unique.
	 * @param {Scene} [scene] - The scene to render. The default scene contains a single mesh that fills the screen.
	 * @param {Camera} [camera] - A camera. Fullscreen effect passes don't require a camera.
	 */

	constructor(name = "Pass", scene = new Scene(), camera = new Camera()) {

		/**
		 * The name of this pass.
		 *
		 * @type {String}
		 */

		this.name = name;

		/**
		 * The renderer.
		 *
		 * @deprecated
		 * @type {WebGLRenderer}
		 * @protected
		 */

		this.renderer = null;

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
		 * Indicates whether this pass should render to texture.
		 *
		 * @type {Boolean}
		 * @private
		 */

		this.rtt = true;

		/**
		 * Only relevant for subclassing.
		 *
		 * Indicates whether the {@link EffectComposer} should swap the frame buffers after this pass has finished
		 * rendering. Set this to `false` if this pass doesn't render to the output buffer or the screen. Otherwise, the
		 * contents of the input buffer will be lost.
		 *
		 * @type {Boolean}
		 */

		this.needsSwap = true;

		/**
		 * Only relevant for subclassing.
		 *
		 * Indicates whether the {@link EffectComposer} should prepare a depth texture for this pass.
		 * Set this to `true` if this pass relies on depth information from a preceding {@link RenderPass}.
		 *
		 * @type {Boolean}
		 */

		this.needsDepthTexture = false;

		/**
		 * Indicates whether this pass is enabled.
		 *
		 * @type {Boolean}
		 */

		this.enabled = true;

	}

	/**
	 * Sets the render to screen flag.
	 *
	 * If this flag is changed, the fullscreen material will be updated as well.
	 *
	 * @type {Boolean}
	 */

	get renderToScreen() {

		return !this.rtt;

	}

	set renderToScreen(value) {

		if(this.rtt === value) {

			const material = this.fullscreenMaterial;

			if(material !== null) {

				material.needsUpdate = true;

			}

			this.rtt = !value;

		}

	}

	/**
	 * Sets the main scene.
	 *
	 * @type {Scene}
	 */

	set mainScene(value) {}

	/**
	 * Sets the main camera.
	 *
	 * @type {Camera}
	 */

	set mainCamera(value) {}

	/**
	 * Sets the renderer
	 *
	 * @deprecated
	 * @param {WebGLRenderer} renderer - The renderer.
	 */

	setRenderer(renderer) {

		this.renderer = renderer;

	}

	/**
	 * Indicates whether this pass is enabled.
	 *
	 * @deprecated Use enabled instead.
	 * @return {Boolean} Whether this pass is enabled.
	 */

	isEnabled() {

		return this.enabled;

	}

	/**
	 * Enables or disables this pass.
	 *
	 * @deprecated Use enabled instead.
	 * @param {Boolean} value - Whether the pass should be enabled.
	 */

	setEnabled(value) {

		this.enabled = value;

	}

	/**
	 * The fullscreen material.
	 *
	 * @type {Material}
	 */

	get fullscreenMaterial() {

		return (this.screen !== null) ? this.screen.material : null;

	}

	set fullscreenMaterial(value) {

		let screen = this.screen;

		if(screen !== null) {

			screen.material = value;

		} else {

			screen = new Mesh(Pass.fullscreenGeometry, value);
			screen.frustumCulled = false;

			if(this.scene === null) {

				this.scene = new Scene();

			}

			this.scene.add(screen);
			this.screen = screen;

		}

	}

	/**
	 * Returns the current fullscreen material.
	 *
	 * @deprecated Use fullscreenMaterial instead.
	 * @return {Material} The current fullscreen material, or null if there is none.
	 */

	getFullscreenMaterial() {

		return this.fullscreenMaterial;

	}

	/**
	 * Sets the fullscreen material.
	 *
	 * @deprecated Use fullscreenMaterial instead.
	 * @protected
	 * @param {Material} value - A fullscreen material.
	 */

	setFullscreenMaterial(value) {

		this.fullscreenMaterial = value;

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
	 * This method will be called automatically by the {@link EffectComposer}.
	 * You may override this method if your pass relies on the depth information of a preceding {@link RenderPass}.
	 *
	 * @param {Texture} depthTexture - A depth texture.
	 * @param {DepthPackingStrategy} [depthPacking=BasicDepthPacking] - The depth packing.
	 */

	setDepthTexture(depthTexture, depthPacking = BasicDepthPacking) {}

	/**
	 * Renders this pass.
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
	 * Sets the size.
	 *
	 * You may override this method if you want to be informed about the size of the backbuffer/canvas.
	 * This method is called before {@link initialize} and every time the size of the {@link EffectComposer} changes.
	 *
	 * @param {Number} width - The width.
	 * @param {Number} height - The height.
	 */

	setSize(width, height) {}

	/**
	 * Performs initialization tasks.
	 *
	 * This method is called when this pass is added to an {@link EffectComposer}.
	 *
	 * @param {WebGLRenderer} renderer - The renderer.
	 * @param {Boolean} alpha - Whether the renderer uses the alpha channel or not.
	 * @param {Number} frameBufferType - The type of the main frame buffers.
	 */

	initialize(renderer, alpha, frameBufferType) {}

	/**
	 * Performs a shallow search for disposable properties and deletes them.
	 *
	 * The {@link EffectComposer} calls this method when it is being destroyed. You can use it independently to free
	 * memory when you're certain that you don't need this pass anymore.
	 */

	dispose() {

		for(const key of Object.keys(this)) {

			const property = this[key];
			const isDisposable = (
				property instanceof WebGLRenderTarget ||
				property instanceof Material ||
				property instanceof Texture ||
				property instanceof Pass
			);

			if(isDisposable) {

				this[key].dispose();

			}

		}

		if(this.fullscreenMaterial !== null) {

			this.fullscreenMaterial.dispose();

		}

	}

}
