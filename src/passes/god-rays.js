import { Color, LinearFilter, MeshBasicMaterial, RGBFormat, Scene, Vector3, WebGLRenderTarget } from "three";
import { ConvolutionMaterial, CombineMaterial, GodRaysMaterial } from "../materials";
import { Pass } from "./pass.js";

/**
 * Clamps a given value.
 *
 * @method clamp
 * @private
 * @static
 * @param {Number} value - The value to clamp.
 * @param {Number} min - The lowest possible value.
 * @param {Number} max - The highest possible value.
 * @return {Number} The clamped value.
 */

function clamp(value, min, max) {

	return Math.max(min, Math.min(max, value));

}

/**
 * A clear color.
 *
 * @property CLEAR_COLOR
 * @type Color
 * @private
 * @static
 */

const CLEAR_COLOR = new Color();

/**
 * A crepuscular rays pass.
 *
 * @class GodRaysPass
 * @submodule passes
 * @extends Pass
 * @constructor
 * @param {Scene} scene - The main scene.
 * @param {Camera} camera - The main camera.
 * @param {Object3D} lightSource - The main light source.
 * @param {Object} [options] - The options.
 * @param {Number} [options.density=0.96] - The density of the light rays.
 * @param {Number} [options.decay=0.93] - An illumination decay factor.
 * @param {Number} [options.weight=0.4] - A light ray weight factor.
 * @param {Number} [options.exposure=0.6] - A constant attenuation coefficient.
 * @param {Number} [options.clampMax=1.0] - An upper bound for the saturation of the overall effect.
 * @param {Number} [options.intensity=1.0] - A constant factor for additive blending.
 * @param {Number} [options.blurriness=0.1] - The strength of the preliminary blur phase.
 * @param {Number} [options.resolutionScale=0.5] - The render texture resolution scale, relative to the screen render size.
 * @param {Number} [options.samples=60] - The number of samples per pixel.
 * @param {Number} [options.screenMode=true] - Whether the screen blend mode should be used for combining the god rays texture with the scene colors.
 */

export class GodRaysPass extends Pass {

	constructor(scene, camera, lightSource, options = {}) {

		super();

		/**
		 * A render target for rendering the masked scene.
		 *
		 * @property renderTargetMask
		 * @type WebGLRenderTarget
		 * @private
		 */

		this.renderTargetMask = new WebGLRenderTarget(1, 1, {
			minFilter: LinearFilter,
			magFilter: LinearFilter,
			generateMipmaps: false
		});

		/**
		 * A render target.
		 *
		 * @property renderTargetX
		 * @type WebGLRenderTarget
		 * @private
		 */

		this.renderTargetX = this.renderTargetMask.clone();
		this.renderTargetX.stencilBuffer = false;
		this.renderTargetX.depthBuffer = false;

		/**
		 * A second render target.
		 *
		 * @property renderTargetY
		 * @type WebGLRenderTarget
		 * @private
		 */

		this.renderTargetY = this.renderTargetX.clone();

		/**
		 * The resolution scale.
		 *
		 * You need to call the setSize method of the EffectComposer after changing
		 * this value.
		 *
		 * @property resolutionScale
		 * @type Number
		 * @default 0.5
		 */

		this.resolutionScale = (options.resolutionScale === undefined) ? 0.5 : options.resolutionScale;

		/**
		 * The light source.
		 *
		 * @property lightSource
		 * @type Object3D
		 */

		this.lightSource = lightSource;

		/**
		 * The light position in screen space.
		 *
		 * @property screenPosition
		 * @type Vector3
		 * @private
		 */

		this.screenPosition = new Vector3();

		/**
		 * A convolution blur shader material.
		 *
		 * @property convolutionMaterial
		 * @type ConvolutionMaterial
		 * @private
		 */

		this.convolutionMaterial = new ConvolutionMaterial();

		this.blurriness = (options.blurriness !== undefined) ? options.blurriness : 0.1;

		/**
		 * A combine shader material used for rendering to screen.
		 *
		 * @property combineMaterial
		 * @type CombineMaterial
		 * @private
		 */

		this.combineMaterial = new CombineMaterial((options.screenMode !== undefined) ? options.screenMode : true);

		/**
		 * A material used for masking the scene objects.
		 *
		 * @property maskMaterial
		 * @type MeshBasicMaterial
		 * @private
		 */

		this.maskMaterial = new MeshBasicMaterial({ color: 0x000000 });

		/**
		 * God rays shader material.
		 *
		 * @property godRaysMaterial
		 * @type GodRaysMaterial
		 * @private
		 */

		this.godRaysMaterial = new GodRaysMaterial();
		this.godRaysMaterial.uniforms.lightPosition.value = this.screenPosition;

		if(options.exposure !== undefined) { this.godRaysMaterial.uniforms.exposure.value = options.exposure; }
		if(options.density !== undefined) { this.godRaysMaterial.uniforms.density.value = options.density; }
		if(options.decay !== undefined) { this.godRaysMaterial.uniforms.decay.value = options.decay; }
		if(options.weight !== undefined) { this.godRaysMaterial.uniforms.weight.value = options.weight; }
		if(options.clampMax !== undefined) { this.godRaysMaterial.uniforms.clampMax.value = options.clampMax; }

		this.samples = options.samples;
		this.intensity = options.intensity;

		/**
		 * A scene that only contains the light source.
		 *
		 * @property lightScene
		 * @type Scene
		 */

		this.lightScene = new Scene();

		/**
		 * The main scene.
		 *
		 * @property mainScene
		 * @type Scene
		 */

		this.mainScene = scene;

		/**
		 * The main camera.
		 *
		 * @property mainCamera
		 * @type Camera
		 */

		this.mainCamera = camera;

	}

	/**
	 * The strength of the preliminary blur phase.
	 *
	 * @property blurriness
	 * @type Number
	 * @default 0.1
	 */

	get blurriness() { return this.convolutionMaterial.scale; }

	set blurriness(x) {

		this.convolutionMaterial.scale = x;

	}

	/**
	 * The overall intensity of the effect.
	 *
	 * @property intensity
	 * @type Number
	 * @default 1.0
	 */

	get intensity() { return this.combineMaterial.uniforms.opacity2.value; }

	set intensity(x) {

		this.combineMaterial.uniforms.opacity2.value = x;
		this.copyMaterial.uniforms.opacity.value = x;

	}

	/**
	 * The number of samples per pixel.
	 *
	 * This value must be carefully chosen. A higher value increases the GPU load
	 * directly and doesn't necessarily yield better results!
	 *
	 * @property samples
	 * @type Number
	 * @default 60
	 */

	get samples() { return Number.parseInt(this.godRaysMaterial.defines.NUM_SAMPLES_INT); }

	set samples(x) {

		x = Math.floor(x);

		this.godRaysMaterial.defines.NUM_SAMPLES_FLOAT = x.toFixed(1);
		this.godRaysMaterial.defines.NUM_SAMPLES_INT = x.toFixed(0);
		this.godRaysMaterial.needsUpdate = true;

	}

	/**
	 * Renders the scene.
	 *
	 * The read buffer is assumed to contain the normally rendered scene.
	 * The god rays pass has four phases with a total of 8 render steps.
	 *
	 * Mask Phase:
	 *  The scene is rendered using a mask material.
	 *
	 * Preliminary Blur Phase:
	 *  The masked scene is blurred five consecutive times.
	 *
	 * God Rays Phase:
	 *  The blurred scene is blurred again, but this time along radial lines
	 *  towards the light source.
	 *
	 * Composite Phase:
	 *  The final result is added to the normal scene.
	 *
	 * @method render
	 * @param {WebGLRenderer} renderer - The renderer to use.
	 * @param {WebGLRenderTarget} readBuffer - The read buffer.
	 * @param {WebGLRenderTarget} writeBuffer - The write buffer.
	 */

	render(renderer, readBuffer, writeBuffer) {

		const state = renderer.state;

		const quad = this.quad;
		const scene = this.scene;
		const camera = this.camera;
		const mainScene = this.mainScene;
		const lightScene = this.lightScene;
		const mainCamera = this.mainCamera;
		const lightSource = this.lightSource;
		const screenPosition = this.screenPosition;

		const convolutionMaterial = this.convolutionMaterial;
		const godRaysMaterial = this.godRaysMaterial;
		const combineMaterial = this.combineMaterial;

		const renderTargetMask = this.renderTargetMask;
		const renderTargetX = this.renderTargetX;
		const renderTargetY = this.renderTargetY;

		let clearAlpha, background, parent;

		// Compute the screen light position and translate the coordinates to [0, 1].
		screenPosition.copy(lightSource.position).project(mainCamera);
		screenPosition.x = clamp((screenPosition.x + 1.0) * 0.5, 0.0, 1.0);
		screenPosition.y = clamp((screenPosition.y + 1.0) * 0.5, 0.0, 1.0);

		// Render the masked scene.
		state.setDepthWrite(true);

		parent = lightSource.parent;
		background = mainScene.background;
		CLEAR_COLOR.copy(renderer.getClearColor());
		clearAlpha = renderer.getClearAlpha();

		renderer.setClearColor(0x000000, 1);
		mainScene.overrideMaterial = this.maskMaterial;
		mainScene.background = null;
		lightScene.add(lightSource);

		renderer.render(lightScene, mainCamera, renderTargetMask, true);
		renderer.render(mainScene, mainCamera, renderTargetMask);

		if(parent !== null) {

			parent.add(lightSource);

		}

		mainScene.background = background;
		mainScene.overrideMaterial = null;
		renderer.setClearColor(CLEAR_COLOR, clearAlpha);

		state.setDepthWrite(false);

		// Convolution phase (5 passes).
		quad.material = convolutionMaterial;

		convolutionMaterial.adjustKernel();
		convolutionMaterial.uniforms.tDiffuse.value = renderTargetMask.texture;
		renderer.render(scene, camera, renderTargetX);

		convolutionMaterial.adjustKernel();
		convolutionMaterial.uniforms.tDiffuse.value = renderTargetX.texture;
		renderer.render(scene, camera, renderTargetY);

		convolutionMaterial.adjustKernel();
		convolutionMaterial.uniforms.tDiffuse.value = renderTargetY.texture;
		renderer.render(scene, camera, renderTargetX);

		convolutionMaterial.adjustKernel();
		convolutionMaterial.uniforms.tDiffuse.value = renderTargetX.texture;
		renderer.render(scene, camera, renderTargetY);

		convolutionMaterial.adjustKernel();
		convolutionMaterial.uniforms.tDiffuse.value = renderTargetY.texture;
		renderer.render(scene, camera, renderTargetX);

		// God rays pass.
		quad.material = godRaysMaterial;
		godRaysMaterial.uniforms.tDiffuse.value = renderTargetX.texture;
		renderer.render(scene, camera, renderTargetY);

		// Final pass - composite god rays onto colors.
		quad.material = combineMaterial;
		combineMaterial.uniforms.texture1.value = readBuffer.texture;
		combineMaterial.uniforms.texture2.value = renderTargetY.texture;

		renderer.render(scene, camera, this.renderToScreen ? null : writeBuffer, this.clear);

	}

	/**
	 * Adjusts the format of the render targets.
	 *
	 * @method initialise
	 * @param {WebGLRenderer} renderer - The renderer.
	 * @param {Boolean} alpha - Whether the renderer uses the alpha channel or not.
	 */

	initialise(renderer, alpha) {

		if(!alpha) {

			this.renderTargetMask.texture.format = RGBFormat;
			this.renderTargetX.texture.format = RGBFormat;
			this.renderTargetY.texture.format = RGBFormat;

		}

	}

	/**
	 * Updates this pass with the renderer's size.
	 *
	 * @method setSize
	 * @param {Number} width - The width.
	 * @param {Number} height - The height.
	 */

	setSize(width, height) {

		width = Math.max(1, Math.floor(width * this.resolutionScale));
		height = Math.max(1, Math.floor(height * this.resolutionScale));

		this.renderTargetMask.setSize(width, height);
		this.renderTargetX.setSize(width, height);
		this.renderTargetY.setSize(width, height);

		this.convolutionMaterial.setTexelSize(1.0 / width, 1.0 / height);

	}

}
