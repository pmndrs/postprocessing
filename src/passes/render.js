import { Pass } from "./pass";
import THREE from "three";

/**
 * Used for saving the original clear color during rendering.
 *
 * @property clearColor
 * @type Color
 * @private
 * @static
 */

const clearColor = new THREE.Color();

/**
 * A pass that renders a given scene directly on screen
 * or into the read buffer for further processing.
 *
 * In addition to that, this pass can also render a depth 
 * texture which may be used by other passes.
 *
 * @class RenderPass
 * @constructor
 * @extends Pass
 * @param {Scene} scene - The scene to render.
 * @param {Camera} camera - The camera to use to render the scene.
 * @param {Object} [options] - Additional options.
 * @param {Boolean} [options.depth=false] - Indicates whether this pass should also render a scene depth texture.
 * @param {Boolean} [options.depthResolutionScale=0.5] - The resolution scale of the depth texture, relative to the main render size.
 * @param {Material} [options.overrideMaterial] - An override material for the scene.
 * @param {Color} [options.clearColor] - An override clear color.
 * @param {Number} [options.clearAlpha] - An override clear alpha.
 */

export class RenderPass extends Pass {

	constructor(scene, camera, options) {

		super(scene, camera, null);

		if(options === undefined) { options = {}; }

		/**
		 * Depth render flag.
		 *
		 * @property depth
		 * @type Boolean
		 * @default false
		 */

		this.depth = (options.depth !== undefined) ? options.depth : false;

		/**
		 * The depth texture.
		 *
		 * @property depthTexture
		 * @type WebGLRenderTarget
		 */

		this.depthTexture = !this.depth ? null : new THREE.WebGLRenderTarget(1, 1, {
			minFilter: THREE.LinearFilter,
			magFilter: THREE.LinearFilter,
			generateMipmaps: false
		});

		/**
		 * A depth shader material.
		 *
		 * @property MeshDepthMaterial
		 * @type Material
		 * @private
		 */

		this.depthMaterial = !this.depth ? null : new THREE.MeshDepthMaterial();

		/**
		 * The resolution scale of the depth texture, relative to the main 
		 * render size.
		 *
		 * You need to call the setSize method of the EffectComposer after 
		 * changing this value.
		 *
		 * @property depthResolutionScale
		 * @type Number
		 * @default 0.5
		 */

		this.depthResolutionScale = (options.depthResolutionScale === undefined) ? 0.5 : options.depthResolutionScale;

		/**
		 * Override material.
		 *
		 * @property overrideMaterial
		 * @type Material
		 */

		this.overrideMaterial = (options.overrideMaterial !== undefined) ? options.overrideMaterial : null;

		/**
		 * Clear color.
		 *
		 * @property clearColor
		 * @type Color
		 */

		this.clearColor = (options.clearColor !== undefined) ? options.clearColor : null;

		/**
		 * Clear alpha.
		 *
		 * @property clearAlpha
		 * @type Number
		 */

		this.clearAlpha = (options.clearAlpha === undefined) ? 1.0 : THREE.Math.clamp(options.clearAlpha, 0.0, 1.0);

		/**
		 * Clear flag.
		 *
		 * @property clear
		 * @type Boolean
		 * @default true
		 */

		this.clear = true;

	}

	/**
	 * Renders the scene.
	 *
	 * @method render
	 * @param {WebGLRenderer} renderer - The renderer to use.
	 * @param {WebGLRenderTarget} readBuffer - The read buffer.
	 */

	render(renderer, readBuffer) {

		let clearAlpha;

		if(this.depth) {

			this.scene.overrideMaterial = this.depthMaterial;
			renderer.render(this.scene, this.camera, this.depthTexture, true);
			this.scene.overrideMaterial = null;

		}

		this.scene.overrideMaterial = this.overrideMaterial;

		if(this.clearColor !== null) {

			clearColor.copy(renderer.getClearColor());
			clearAlpha = renderer.getClearAlpha();
			renderer.setClearColor(this.clearColor, this.clearAlpha);

		}

		if(this.renderToScreen) {

			renderer.render(this.scene, this.camera, null, this.clear);

		} else {

			renderer.render(this.scene, this.camera, readBuffer, this.clear);

		}

		if(this.clearColor !== null) {

			renderer.setClearColor(clearColor, clearAlpha);

		}

		this.scene.overrideMaterial = null;

	}

	/**
	 * Adjusts the format and size of the depth render target.
	 *
	 * @method initialise
	 * @param {WebGLRenderer} renderer - The renderer.
	 * @param {Boolean} alpha - Whether the renderer uses the alpha channel or not.
	 */

	initialise(renderer, alpha) {

		let size;

		if(this.depth) {

			size = renderer.getSize();
			this.setSize(size.width, size.height);

			if(!alpha) {

				this.depthTexture.texture.format = THREE.RGBFormat;

			}

		}

	}

	/**
	 * Updates the depth render target with the renderer's size.
	 *
	 * @method setSize
	 * @param {Number} width - The width.
	 * @param {Number} height - The height.
	 */

	setSize(width, height) {

		if(this.depth) {

			width = Math.floor(width * this.depthResolutionScale);
			height = Math.floor(height * this.depthResolutionScale);

			if(width <= 0) { width = 1; }
			if(height <= 0) { height = 1; }

			this.depthTexture.setSize(width, height);

		}

	}

}
