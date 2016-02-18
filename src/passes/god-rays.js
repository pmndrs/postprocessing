import {
	ConvolutionMaterial,
	CombineMaterial,
	CopyMaterial,
	GodRaysMaterial
} from "../materials";

import { Pass } from "./pass";
import THREE from "three";

/**
 * A crepuscular rays pass.
 *
 * @class GodRaysPass
 * @constructor
 * @extends Pass
 * @param {Scene} scene - The main scene.
 * @param {Camera} camera - The main camera.
 * @param {Vector3} lightSource - The main light source.
 * @param {Object} [options] - The options.
 * @param {Number} [options.density=0.96] - The density of the light rays.
 * @param {Number} [options.decay=0.93] - An illumination decay factor.
 * @param {Number} [options.weight=0.4] - A light ray weight factor.
 * @param {Number} [options.exposure=0.6] - A constant attenuation coefficient.
 * @param {Number} [options.clampMax=1.0] - An upper bound for the saturation of the overall effect.
 * @param {Number} [options.intensity=1.0] - A constant factor for additive blending.
 * @param {Number} [options.blurriness=1.0] - The strength of the preliminary blur phase.
 * @param {Number} [options.resolutionScale=0.5] - The render texture resolution scale, relative to the screen render size.
 * @param {Number} [options.samples=20] - The number of samples per pixel.
 */

export function GodRaysPass(scene, camera, lightSource, options) {

	Pass.call(this);

	if(options === undefined) { options = {}; }

	/**
	 * A render target.
	 *
	 * @property renderTargetX
	 * @type WebGLRenderTarget
	 * @private
	 */

	this.renderTargetX = new THREE.WebGLRenderTarget(1, 1, {
		minFilter: THREE.LinearFilter,
		magFilter: THREE.LinearFilter,
		format: THREE.RGBFormat,
		stencilBuffer: false
	});

	this.renderTargetX.texture.generateMipmaps = false;

	/**
	 * Another render target.
	 *
	 * @property renderTargetY
	 * @type WebGLRenderTarget
	 * @private
	 */

	this.renderTargetY = this.renderTargetX.clone();
	this.renderTargetY.depthBuffer = false;

	/**
	 * The resolution scale.
	 *
	 * You need to call the reset method of the EffectComposer 
	 * after changing this value.
	 *
	 * @property renderTargetY
	 * @type WebGLRenderTarget
	 * @private
	 */

	this.resolutionScale = (options.resolutionScale === undefined) ? 0.5 : options.resolutionScale;

	/**
	 * The light source.
	 *
	 * @property lightSource
	 * @type Object3D
	 */

	this.lightSource = (lightSource !== undefined) ? lightSource : new THREE.Object3D();

	/**
	 * The light position in screen space.
	 *
	 * @property screenPosition
	 * @type Vector3
	 * @private
	 */

	this.screenPosition = new THREE.Vector3();

	/**
	 * The texel size for the blur.
	 *
	 * @property texelSize
	 * @type Vector2
	 * @private
	 */

	this.texelSize = new THREE.Vector2();

	/**
	 * A convolution blur shader material.
	 *
	 * @property convolutionMaterial
	 * @type ConvolutionMaterial
	 * @private
	 */

	this.convolutionMaterial = new ConvolutionMaterial();

	/**
	 * A combine shader material used for rendering to screen.
	 *
	 * @property combineMaterial
	 * @type CombineMaterial
	 * @private
	 */

	this.combineMaterial = new CombineMaterial();

	/**
	 * A copy shader material used for rendering to texture.
	 *
	 * @property copyMaterial
	 * @type CopyMaterial
	 * @private
	 */

	this.copyMaterial = new CopyMaterial();
	this.copyMaterial.blending = THREE.AdditiveBlending;
	this.copyMaterial.transparent = true;

	/**
	 * A material used for masking the scene objects.
	 *
	 * @property maskMaterial
	 * @type MeshBasicMaterial
	 * @private
	 */

	this.maskMaterial = new THREE.MeshBasicMaterial({color: 0x000000});

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
	 * A main scene.
	 *
	 * @property mainScene
	 * @type Scene
	 */

	this.mainScene = (scene !== undefined) ? scene : new THREE.Scene();

	/**
	 * The main camera.
	 *
	 * @property mainCamera
	 * @type Camera
	 */

	this.mainCamera = (camera !== undefined) ? camera : new THREE.PerspectiveCamera();

	// Swap read and write buffer when done.
	this.needsSwap = true;

	// Set the blur strength.
	this.blurriness = options.blurriness;

}

GodRaysPass.prototype = Object.create(Pass.prototype);
GodRaysPass.prototype.constructor = GodRaysPass;

/**
 * The strength of the preliminary blur phase.
 *
 * @property blurriness
 * @type Number
 * @default 1.0
 */

Object.defineProperty(GodRaysPass.prototype, "blurriness", {

	get: function() { return this.convolutionMaterial.blurriness; },

	set: function(x) {

		if(typeof x === "number") {

			this.convolutionMaterial.blurriness = x;

		}

	}

});

/**
 * The overall intensity of the effect.
 *
 * @property intensity
 * @type Number
 * @default 1.0
 */

Object.defineProperty(GodRaysPass.prototype, "intensity", {

	get: function() { return this.combineMaterial.uniforms.opacity2.value; },

	set: function(x) {

		if(typeof x === "number") {

			this.combineMaterial.uniforms.opacity2.value = x;
			this.copyMaterial.uniforms.opacity.value = x;

		}

	}

});

/**
 * The number of samples per pixel.
 *
 * This value must be carefully chosen. A higher value increases the 
 * GPU load directly and doesn't necessarily yield better results!
 *
 * @property samples
 * @type Number
 * @default 20
 */

Object.defineProperty(GodRaysPass.prototype, "samples", {

	get: function() {

		return Number.parseInt(this.godRaysMaterial.defines.NUM_SAMPLES_INT);

	},

	set: function(x) {

		if(typeof x === "number" && x > 0) {

			x = Math.floor(x);

			this.godRaysMaterial.defines.NUM_SAMPLES_FLOAT = x.toFixed(1);
			this.godRaysMaterial.defines.NUM_SAMPLES_INT = x.toFixed(0);
			this.godRaysMaterial.needsUpdate = true;

		}

	}

});

/**
 * Used for saving the original clear color 
 * during the rendering process of the masked scene.
 *
 * @property clearColor
 * @type Color
 * @private
 * @static
 */

var clearColor = new THREE.Color();

/**
 * Renders the scene.
 *
 * The read buffer is assumed to contain the normally rendered scene.
 * The god rays pass has four phases with a total of 8 render steps.
 *
 * Mask Phase:
 *  The scene is rendered using a mask material.
 *
 * Prelminiary Blur Phase:
 *  The masked scene is blurred five consecutive times.
 *
 * God Rays Phase:
 *  The blurred scene is blurred again, but this time along radial lines towards the light source.
 *
 * Composite Phase:
 *  The final result is added to the normal scene.
 *
 * @method render
 * @param {WebGLRenderer} renderer - The renderer to use.
 * @param {WebGLRenderTarget} writeBuffer - The write buffer.
 * @param {WebGLRenderTarget} readBuffer - The read buffer.
 */

GodRaysPass.prototype.render = function(renderer, writeBuffer, readBuffer) {

	var clearAlpha;

	// Compute the screen light position and translate the coordinates to [0, 1].
	this.screenPosition.copy(this.lightSource.position).project(this.mainCamera);
	this.screenPosition.x = THREE.Math.clamp((this.screenPosition.x + 1.0) * 0.5, 0.0, 1.0);
	this.screenPosition.y = THREE.Math.clamp((this.screenPosition.y + 1.0) * 0.5, 0.0, 1.0);

	// Don't show the rays from acute angles.
	//this.godRaysMaterial.uniforms.exposure.value = this.computeAngularScalar() * 0.6;

	// Render the masked scene.
	this.mainScene.overrideMaterial = this.maskMaterial;
	clearColor.copy(renderer.getClearColor());
	clearAlpha = renderer.getClearAlpha();
	renderer.setClearColor(0x000000, 1);
	//renderer.render(this.mainScene, this.mainCamera, null, true); // Debug.
	renderer.render(this.mainScene, this.mainCamera, this.renderTargetX, true);
	renderer.setClearColor(clearColor, clearAlpha);
	this.mainScene.overrideMaterial = null;

	// Convolution phase (5 passes).
	this.quad.material = this.convolutionMaterial;

	this.convolutionMaterial.adjustKernel();
	this.convolutionMaterial.uniforms.tDiffuse.value = this.renderTargetX;
	renderer.render(this.scene, this.camera, this.renderTargetY);

	this.convolutionMaterial.adjustKernel();
	this.convolutionMaterial.uniforms.tDiffuse.value = this.renderTargetY;
	renderer.render(this.scene, this.camera, this.renderTargetX);

	this.convolutionMaterial.adjustKernel();
	this.convolutionMaterial.uniforms.tDiffuse.value = this.renderTargetX;
	renderer.render(this.scene, this.camera, this.renderTargetY);

	this.convolutionMaterial.adjustKernel();
	this.convolutionMaterial.uniforms.tDiffuse.value = this.renderTargetY;
	renderer.render(this.scene, this.camera, this.renderTargetX);

	this.convolutionMaterial.adjustKernel();
	this.convolutionMaterial.uniforms.tDiffuse.value = this.renderTargetX;
	renderer.render(this.scene, this.camera, this.renderTargetY);

	// God rays pass.
	this.quad.material = this.godRaysMaterial;
	this.godRaysMaterial.uniforms.tDiffuse.value = this.renderTargetY;
	renderer.render(this.scene, this.camera, this.renderTargetX);

	// Final pass - composite god rays onto colors.
	if(this.renderToScreen) {

		this.quad.material = this.combineMaterial;
		this.combineMaterial.uniforms.texture1.value = readBuffer;
		this.combineMaterial.uniforms.texture2.value = this.renderTargetX;

		renderer.render(this.scene, this.camera);

	} else {

		this.quad.material = this.copyMaterial;
		this.copyMaterial.uniforms.tDiffuse.value = this.renderTargetX;

		renderer.render(this.scene, this.camera, readBuffer);

	}

};

/**
 * Updates this pass with the main render target's size.
 *
 * @method setSize
 * @param {Number} width - The width.
 * @param {Number} height - The height.
 */

GodRaysPass.prototype.setSize = function(width, height) {

	width = Math.floor(width * this.resolutionScale);
	height = Math.floor(height * this.resolutionScale);

	if(width <= 0) { width = 1; }
	if(height <= 0) { height = 1; }

	this.renderTargetX.setSize(width, height);
	this.renderTargetY.setSize(width, height);

	this.texelSize.set(1.0 / width, 1.0 / height);
	this.convolutionMaterial.setTexelSize(this.texelSize);

};
