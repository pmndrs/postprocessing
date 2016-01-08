import { GodRaysMaterial, Phase } from "../materials";
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
 * @param {Number} [options.resolutionScale=0.2] - The god rays render texture resolution scale, relative to the on-screen render size.
 * @param {Number} [options.samples=6] - The number of samples per pixel.
 */

export function GodRaysPass(scene, camera, lightSource, options) {

	Pass.call(this, scene, camera);

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

	this.renderTargets.push(this.renderTargetX);

	/**
	 * Another render target.
	 *
	 * @property renderTargetY
	 * @type WebGLRenderTarget
	 * @private
	 */

	this.renderTargetY = this.renderTargets[0].clone();
	this.renderTargets.push(this.renderTargetY);

	// MIP maps aren't needed.
	this.renderTargetX.texture.generateMipmaps = false;
	this.renderTargetY.texture.generateMipmaps = false;

	/**
	 * The resolution scale.
	 *
	 * @property resolutionScale
	 * @type Number
	 * @private
	 */

	this.resolutionScale = (options.resolution === undefined) ? 0.2 : THREE.Math.clamp(options.resolution, 0.0, 1.0);

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
	 * @property godRaysGenerateMaterial
	 * @type GodRaysMaterial
	 * @private
	 */

	this.godRaysGenerateMaterial = new GodRaysMaterial(Phase.GENERATE);
	this.godRaysGenerateMaterial.uniforms.lightPosition.value = this.screenLightPosition;
	this.materials.push(this.godRaysGenerateMaterial);

	if(options.decay !== undefined) { this.godRaysGenerateMaterial.uniforms.decay.value = options.decay; }
	if(options.weight !== undefined) { this.godRaysGenerateMaterial.uniforms.weight.value = options.weight; }

	/**
	 * The exposure coefficient.
	 *
	 * This value is scaled based on the user's view direction and 
	 * is sent to the god rays shader every frame.
	 *
	 * @property exposure
	 * @type Number
	 */

	if(options.exposure !== undefined) { this.godRaysGenerateMaterial.uniforms.exposure.value = options.exposure; }
	this.exposure = this.godRaysGenerateMaterial.uniforms.exposure.value;

	/**
	 * God rays shader material for the final composite phase.
	 *
	 * @property godRaysCombineMaterial
	 * @type GodRaysMaterial
	 * @private
	 */

	this.godRaysCombineMaterial = new GodRaysMaterial(Phase.COMBINE);
	this.materials.push(this.godRaysCombineMaterial);

	if(options.intensity !== undefined) { this.godRaysCombineMaterial.uniforms.intensity.value = options.intensity; }

	/**
	 * A material used for masking the scene objects.
	 *
	 * @property maskMaterial
	 * @type MeshBasicMaterial
	 * @private
	 */

	this.maskMaterial = new THREE.MeshBasicMaterial({color: 0x000000});
	this.materials.push(this.maskMaterial);

	/**
	 * The maximum length of god-rays (in texture space [0.0, 1.0]).
	 *
	 * @property _rayLength
	 * @type Number
	 * @private
	 */

	this._rayLength = (options.rayLength !== undefined) ? THREE.Math.clamp(options.rayLength, 0.0, 1.0) : 1.0;

	/**
	 * The maximum ray length translates to step sizes for the 3 generate passes.
	 *
	 * @property stepSizes
	 * @type Float32Array
	 * @private
	 */

	this.stepSizes = new Float32Array(3);

	// Setting the amount of samples indirectly computes the actual step sizes.
	this.samples = options.samples;

	/**
	 * Render to screen flag.
	 *
	 * @property renderToScreen
	 * @type Boolean
	 * @default false
	 */

	this.renderToScreen = false;

	/**
	 * A scene to render the god rays with.
	 *
	 * @property scene2
	 * @type Scene
	 * @private
	 */

	this.scene2  = new THREE.Scene();

	/**
	 * A camera to render the god rays with.
	 *
	 * @property camera2
	 * @type Camera
	 * @private
	 */

	this.camera2 = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
	this.scene2.add(this.camera2);

	/**
	 * The quad mesh to use for rendering the 2D effect.
	 *
	 * @property quad
	 * @type Mesh
	 * @private
	 */

	this.quad = new THREE.Mesh(new THREE.PlaneBufferGeometry(2, 2), null);
	this.scene2.add(this.quad);

	// Swap read and write buffer when done.
	this.needsSwap = true;

}

GodRaysPass.prototype = Object.create(Pass.prototype);
GodRaysPass.prototype.constructor = GodRaysPass;

/**
 * The resolution scale, relative to the on-screen render size.
 *
 * @property resolution
 * @type Number
 */

Object.defineProperty(GodRaysPass.prototype, "resolution", {

	get: function() { return this.resolutionScale; },

	set: function(x) {

		if(!Number.isNaN(x)) {

			this.resolutionScale = THREE.Math.clamp(x, 0.0, 1.0);
			this.setSize(this.renderTargetX.width, this.renderTargetX.height);

		}

	}

});

/**
 * The overall intensity of the effect.
 *
 * @property intensity
 * @type Number
 */

Object.defineProperty(GodRaysPass.prototype, "intensity", {

	get: function() { return this.godRaysCombineMaterial.uniforms.intensity.value; },

	set: function(x) {

		if(!Number.isNaN(x)) {

			this.godRaysCombineMaterial.uniforms.intensity.value = x;

		}

	}

});

/**
 * The maximum length of god rays (in texture space [0.0, 1.0]).
 *
 * @property rayLength
 * @type Number
 */

Object.defineProperty(GodRaysPass.prototype, "rayLength", {

	get: function() { return this._rayLength; },

	set: function(x) {

		if(!Number.isNaN(x)) {

			this._rayLength = THREE.Math.clamp(x, 0.0, 1.0);
			this.calculateStepSizes();

		}

	}

});

/**
 * The number of samples per pixel.
 *
 * This value must be carefully chosen. A higher value increases 
 * the GPU load and doesn't necessarily yield better results!
 * For a low render resolution, a value of 6 is recommended, 
 * whereas a value of 8 is best suited for high resolutions.
 *
 * @property samples
 * @type Number
 */

Object.defineProperty(GodRaysPass.prototype, "samples", {

	get: function() {

		return Number.parseInt(this.godRaysGenerateMaterial.defines.NUM_SAMPLES_INT);

	},

	set: function(x) {

		if(!Number.isNaN(x)) {

			x = Math.floor(x);

			this.godRaysGenerateMaterial.defines.NUM_SAMPLES_FLOAT = x.toFixed(1);
			this.godRaysGenerateMaterial.defines.NUM_SAMPLES_INT = x.toFixed(0);

		}

		this.calculateStepSizes();

	}

});

/**
 * Adjusts the sampling step sizes for the three passes.
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
 * Renders the scene.
 *
 * @method render
 * @param {WebGLRenderer} renderer - The renderer to use.
 * @param {WebGLRenderTarget} writeBuffer - The write buffer.
 * @param {WebGLRenderTarget} readBuffer - The read buffer.
 */

GodRaysPass.prototype.render = function(renderer, writeBuffer, readBuffer) {

	var clearColor;

	// Compute the screen light position and translate the coordinates to [-1, 1].
	this.screenLightPosition.copy(this.lightSource.position).project(this.camera);
	this.screenLightPosition.x = THREE.Math.clamp((this.screenLightPosition.x + 1.0) * 0.5, -1.0, 1.0);
	this.screenLightPosition.y = THREE.Math.clamp((this.screenLightPosition.y + 1.0) * 0.5, -1.0, 1.0);

	// Don't show the rays from weird angles.
	this.godRaysGenerateMaterial.uniforms.exposure.value = this.computeAngularScalar() * this.exposure;

	// Render masked scene into texture.
	this.scene.overrideMaterial = this.maskMaterial;
	clearColor = renderer.getClearColor().getHex();
	renderer.setClearColor(0x000000);
	renderer.render(this.scene, this.camera, this.renderTargetX, true);
	renderer.setClearColor(clearColor);
	this.scene.overrideMaterial = null;

	// God rays - Pass 1.
	this.quad.material = this.godRaysGenerateMaterial;
	this.godRaysGenerateMaterial.uniforms.stepSize.value = this.stepSizes[0];
	this.godRaysGenerateMaterial.uniforms.tDiffuse.value = this.renderTargetX;
	renderer.render(this.scene2, this.camera2, this.renderTargetY);

	// God rays - Pass 2.
	this.godRaysGenerateMaterial.uniforms.stepSize.value = this.stepSizes[1];
	this.godRaysGenerateMaterial.uniforms.tDiffuse.value = this.renderTargetY;
	renderer.render(this.scene2, this.camera2, this.renderTargetX);

	// God rays - Pass 3.
	this.godRaysGenerateMaterial.uniforms.stepSize.value = this.stepSizes[2];
	this.godRaysGenerateMaterial.uniforms.tDiffuse.value = this.renderTargetX;
	renderer.render(this.scene2, this.camera2, this.renderTargetY);

	// Final pass - Composite god rays onto colors.
	this.quad.material = this.godRaysCombineMaterial;
	this.godRaysCombineMaterial.uniforms.tDiffuse.value = readBuffer;
	this.godRaysCombineMaterial.uniforms.tGodRays.value = this.renderTargetY;

	if(this.renderToScreen) {

		renderer.render(this.scene2, this.camera2);

	} else {

		renderer.render(this.scene2, this.camera2, writeBuffer);

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

// Computation helpers.
var HALF_PI = Math.PI * 0.5;
var localPoint = new THREE.Vector3(0, 0, -1);
var cameraDirection = new THREE.Vector3();
var lightDirection = new THREE.Vector3();

GodRaysPass.prototype.computeAngularScalar = function() {

	//this.camera.getWorldDirection(cameraDirection);

	// Save camera space point. Using lightDirection as a clipboard.
	lightDirection.copy(localPoint);
	// Camera space to world space.
	cameraDirection.copy(localPoint.applyMatrix4(this.camera.matrixWorld));
	// Restore local point.
	localPoint.copy(lightDirection);

	// Let these be one and the same point.
	lightDirection.copy(cameraDirection);
	// Now compute the actual directions.
	cameraDirection.sub(this.camera.position);
	lightDirection.sub(this.lightSource.position);

	// Compute the angle between the directions.
	// Don't allow acute angles and make a scalar out of it.
	return THREE.Math.clamp(cameraDirection.angleTo(lightDirection) - HALF_PI, 0.0, 1.0);

};

/**
 * Updates this pass's render size.
 *
 * @method setSize
 * @param {Number} width - The width.
 * @param {Number} height - The height.
 */

GodRaysPass.prototype.setSize = function(width, height) {

	//width = height = 1024;

	this.renderTargetX.setSize(Math.floor(width * this.resolutionScale), Math.floor(height * this.resolutionScale));

	if(this.renderTargetX.width <= 0) { this.renderTargetX.width = 1; }
	if(this.renderTargetX.height <= 0) { this.renderTargetX.height = 1; }

	this.renderTargetY.setSize(this.renderTargetX.width, this.renderTargetX.height);

};
