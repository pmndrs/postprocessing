import { CombineMaterial, GodRaysMaterial } from "../materials";
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
 * @param {Vector3} lightSource - The most important light source.
 * @param {Object} [options] - The options.
 * @param {Number} [options.rayLength=1.0] - The maximum length of god rays.
 * @param {Number} [options.decay=1.0] - A constant attenuation coefficient.
 * @param {Number} [options.weight=1.0] - A constant attenuation coefficient.
 * @param {Number} [options.exposure=1.0] - A constant attenuation coefficient.
 * @param {Number} [options.intensity=1.0] - A constant factor for additive blending.
 * @param {Number} [options.resolution=512] - The god rays render texture resolution.
 * @param {Number} [options.samples=9] - The number of samples per pixel.
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
		format: THREE.RGBFormat
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
	this.renderTargetY.stencilBuffer = false;
	this.renderTargetY.depthBuffer = false;

	// Set the resolution.
	this.resolution = (options.resolution === undefined) ? 512 : options.resolution;

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
	 * @property screenLightPosition
	 * @type Vector3
	 * @private
	 */

	this.screenLightPosition = new THREE.Vector3();

	/**
	 * God rays shader material for the generate phase.
	 *
	 * @property godRaysMaterial
	 * @type GodRaysMaterial
	 * @private
	 */

	this.godRaysMaterial = new GodRaysMaterial();
	this.godRaysMaterial.uniforms.lightPosition.value = this.screenLightPosition;

	if(options.decay !== undefined) { this.godRaysMaterial.uniforms.decay.value = options.decay; }
	if(options.weight !== undefined) { this.godRaysMaterial.uniforms.weight.value = options.weight; }

	/**
	 * The exposure coefficient.
	 *
	 * This value is scaled based on the user's view direction. 
	 * The product is sent to the god rays shader each frame.
	 *
	 * @property exposure
	 * @type Number
	 */

	if(options.exposure !== undefined) { this.godRaysMaterial.uniforms.exposure.value = options.exposure; }

	this.exposure = this.godRaysMaterial.uniforms.exposure.value;

	/**
	 * Combine shader material for the final composite phase.
	 *
	 * @property combineMaterial
	 * @type CombineMaterial
	 * @private
	 */

	this.combineMaterial = new CombineMaterial();

	if(options.intensity !== undefined) { this.combineMaterial.uniforms.opacity2.value = options.intensity; }

	/**
	 * A material used for masking the scene objects.
	 *
	 * @property maskMaterial
	 * @type MeshBasicMaterial
	 * @private
	 */

	this.maskMaterial = new THREE.MeshBasicMaterial({color: 0x000000});

	/**
	 * The maximum length of god-rays.
	 *
	 * @property _rayLength
	 * @type Number
	 * @private
	 */

	this._rayLength = (options.rayLength !== undefined) ? options.rayLength : 1.0;

	/**
	 * The maximum ray length translated to step sizes for the 3 generate passes.
	 *
	 * @property stepSizes
	 * @type Float32Array
	 * @private
	 */

	this.stepSizes = new Float32Array(3);

	// Setting the amount of samples indirectly computes the actual step sizes.
	this.samples = options.samples;

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

}

GodRaysPass.prototype = Object.create(Pass.prototype);
GodRaysPass.prototype.constructor = GodRaysPass;

/**
 * The overall intensity of the effect.
 *
 * @property intensity
 * @type Number
 * @default 1.0
 */

Object.defineProperty(GodRaysPass.prototype, "intensity", {

	get: function() { return this.combineMaterial.uniforms.intensity.value; },

	set: function(x) {

		if(typeof x === "number") {

			this.combineMaterial.uniforms.intensity.value = x;

		}

	}

});

/**
 * The resolution of the render targets. Needs to be a power of 2.
 *
 * @property resolution
 * @type Number
 * @default 512
 */

Object.defineProperty(GodRaysPass.prototype, "resolution", {

	get: function() { return this.renderTargetX.width; },

	set: function(x) {

		if(typeof x === "number") {

			if(x <= 0) { x = 1; }

			this.renderTargetX.setSize(x, x);
			this.renderTargetY.setSize(x, x);

		}

	}

});

/**
 * The maximum length of god rays.
 *
 * A value of 1.5 is recommended, to ensure that the effect 
 * fills the entire screen at all times.
 *
 * As a result, the whole effect will be spread out further 
 * which requires a slightly higher number of samples per pixel  
 * to prevent visual gaps along the rays. 
 *
 * @property rayLength
 * @type Number
 * @default 1.5
 */

Object.defineProperty(GodRaysPass.prototype, "rayLength", {

	get: function() { return this._rayLength; },

	set: function(x) {

		if(typeof x === "number" && x >= 0.0) {

			this._rayLength = x;
			this.calculateStepSizes();

		}

	}

});

/**
 * The number of samples per pixel.
 *
 * This value must be carefully chosen. A higher value increases the 
 * GPU load directly and doesn't necessarily yield better results!
 *
 * The recommended number of samples is 9.
 * For render resolutions below 1024 and a ray length of 1.0, 7 samples 
 * might also be sufficient.
 *
 * Values above 9 don't have a noticable impact on the quality.
 *
 * @property samples
 * @type Number
 * @default 9
 */

Object.defineProperty(GodRaysPass.prototype, "samples", {

	get: function() {

		return Number.parseInt(this.godRaysMaterial.defines.NUM_SAMPLES_INT);

	},

	set: function(x) {

		if(typeof x === "number" && x >= 1) {

			x = Math.floor(x);

			this.godRaysMaterial.defines.NUM_SAMPLES_FLOAT = x.toFixed(1);
			this.godRaysMaterial.defines.NUM_SAMPLES_INT = x.toFixed(0);

		}

		this.calculateStepSizes();

	}

});

/**
 * Adjusts the sampling step sizes for the three generate passes.
 *
 * @method calculateStepSizes
 * @private
 */

GodRaysPass.prototype.calculateStepSizes = function() {

	var x = this.samples;

	this.stepSizes[0] = this.rayLength * Math.pow(x, -1.0);
	this.stepSizes[1] = this.rayLength * Math.pow(x, -2.0);
	this.stepSizes[2] = this.rayLength * Math.pow(x, -3.0);

};

/**
 * Used for saving the original clear color 
 * during rendering the masked scene.
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
 * The god rays pass has two phases with a total of 4 render steps.
 *
 * Generate-phase:
 *  In the first pass, the masked scene is blurred along radial lines towards the light source.
 *  The result of the previous pass is re-blurred twice with a decreased distance between the samples.
 *
 * Combine-phase:
 *  The result is added to the normal scene.
 *
 * @method render
 * @param {WebGLRenderer} renderer - The renderer to use.
 * @param {WebGLRenderTarget} writeBuffer - The write buffer.
 * @param {WebGLRenderTarget} readBuffer - The read buffer.
 */

GodRaysPass.prototype.render = function(renderer, writeBuffer, readBuffer) {

	var clearAlpha;

	// Compute the screen light position and translate the coordinates to [-1, 1].
	this.screenLightPosition.copy(this.lightSource.position).project(this.mainCamera);
	this.screenLightPosition.x = THREE.Math.clamp((this.screenLightPosition.x + 1.0) * 0.5, -1.0, 1.0);
	this.screenLightPosition.y = THREE.Math.clamp((this.screenLightPosition.y + 1.0) * 0.5, -1.0, 1.0);

	// Don't show the rays from acute angles.
	this.godRaysMaterial.uniforms.exposure.value = this.computeAngularScalar() * this.exposure;

	// Render the masked scene into texture.
	this.mainScene.overrideMaterial = this.maskMaterial;
	clearColor.copy(renderer.getClearColor());
	clearAlpha = renderer.getClearAlpha();
	renderer.setClearColor(0x000000, 1);
	//renderer.render(this.mainScene, this.mainCamera, undefined, true); // Debug.
	renderer.render(this.mainScene, this.mainCamera, this.renderTargetX, true);
	renderer.setClearColor(clearColor, clearAlpha);
	this.mainScene.overrideMaterial = null;

	// God rays - Pass 1.
	this.quad.material = this.godRaysMaterial;
	this.godRaysMaterial.uniforms.stepSize.value = this.stepSizes[0];
	this.godRaysMaterial.uniforms.tDiffuse.value = this.renderTargetX;
	renderer.render(this.scene, this.camera, this.renderTargetY);

	// God rays - Pass 2.
	this.godRaysMaterial.uniforms.stepSize.value = this.stepSizes[1];
	this.godRaysMaterial.uniforms.tDiffuse.value = this.renderTargetY;
	renderer.render(this.scene, this.camera, this.renderTargetX);

	// God rays - Pass 3.
	this.godRaysMaterial.uniforms.stepSize.value = this.stepSizes[2];
	this.godRaysMaterial.uniforms.tDiffuse.value = this.renderTargetX;
	renderer.render(this.scene, this.camera, this.renderTargetY);

	// Final pass - Composite god rays onto colors.
	this.quad.material = this.combineMaterial;
	this.combineMaterial.uniforms.texture1.value = readBuffer;
	this.combineMaterial.uniforms.texture2.value = this.renderTargetY;

	if(this.renderToScreen) {

		renderer.render(this.scene, this.camera);

	} else {

		renderer.render(this.scene, this.camera, writeBuffer);

	}

};

/**
 * Computes the angle between the camera look direction and the light
 * direction in order to create a scalar for the god rays exposure.
 *
 * @method computeAngularScalar
 * @private
 * @return {Number} A scalar in the range 0.0 to 1.0 for a linear transition.
 */

// Static computation helpers.
var HALF_PI = Math.PI * 0.5;
var localPoint = new THREE.Vector3(0, 0, -1);
var cameraDirection = new THREE.Vector3();
var lightDirection = new THREE.Vector3();

GodRaysPass.prototype.computeAngularScalar = function() {

	//this.camera.getWorldDirection(cameraDirection);

	// Save camera space point. Using lightDirection as a clipboard.
	lightDirection.copy(localPoint);
	// Camera space to world space.
	cameraDirection.copy(localPoint.applyMatrix4(this.mainCamera.matrixWorld));
	// Restore local point.
	localPoint.copy(lightDirection);

	// Let these be one and the same point.
	lightDirection.copy(cameraDirection);
	// Now compute the actual directions.
	cameraDirection.sub(this.mainCamera.position);
	lightDirection.sub(this.lightSource.position);

	// Compute the angle between the directions.
	// Don't allow acute angles and make a scalar out of it.
	return THREE.Math.clamp(cameraDirection.angleTo(lightDirection) - HALF_PI, 0.0, 1.0);

};
