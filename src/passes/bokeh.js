import { BokehMaterial } from "../materials";
import { Pass } from "./pass";
import THREE from "three";

/**
 * Depth-of-field pass using a bokeh shader.
 *
 * @class BokehPass
 * @constructor
 * @extends Pass
 * @param {Scene} scene - The scene to render.
 * @param {Camera} camera - The camera to use to render the scene.
 * @param {Object} [options] - Additional parameters.
 * @param {Number} [options.focus] - The focus.
 * @param {Number} [options.aspect] - The aspect.
 * @param {Number} [options.aperture] - The aperture.
 * @param {Number} [options.maxBlur] - The maximum blur.
 * @param {Number} [options.resolution] - The render resolution.
 */

export function BokehPass(scene, camera, options) {

	Pass.call(this);

	if(options === undefined) { options = {}; }
	if(options.resolution === undefined) { options.resolution = 256; }

	/**
	 * A render target.
	 *
	 * @property renderTargetDepth
	 * @type WebGLRenderTarget
	 * @private
	 */

	this.renderTargetDepth = new THREE.WebGLRenderTarget(1, 1, {
		minFilter: THREE.LinearFilter,
		magFilter: THREE.LinearFilter,
		format: THREE.RGBFormat,
		stencilBuffer: false
	});

	this.renderTargetDepth.texture.generateMipmaps = false;

	/**
	 * Depth shader material.
	 *
	 * @property depthMaterial
	 * @type MeshDepthMaterial
	 * @private
	 */

	this.depthMaterial = new THREE.MeshDepthMaterial();

	/**
	 * Bokeh shader material.
	 *
	 * @property bokehMaterial
	 * @type BokehMaterial
	 * @private
	 */

	this.bokehMaterial = new BokehMaterial();
	this.bokehMaterial.uniforms.tDepth.value = this.renderTargetDepth;

	if(options.focus !== undefined) { this.bokehMaterial.uniforms.focus.value = options.focus; }
	if(options.aspect !== undefined) { this.bokehMaterial.uniforms.aspect.value = options.aspect; }
	if(options.aperture !== undefined) { this.bokehMaterial.uniforms.aperture.value = options.aperture; }
	if(options.maxBlur !== undefined) { this.bokehMaterial.uniforms.maxBlur.value = options.maxBlur; }

	/**
	 * Render to screen flag.
	 *
	 * @property renderToScreen
	 * @type Boolean
	 * @default false
	 */

	this.renderToScreen = false;

	/**
	 * A main scene.
	 *
	 * @property mainScene
	 * @type Scene
	 */

	this.mainScene = (scene !== undefined) ? scene : new THREE.Scene();

	/**
	 * A main camera.
	 *
	 * @property mainCamera
	 * @type Camera
	 */

	this.mainCamera = (camera !== undefined) ? camera : new THREE.PerspectiveCamera();

	// Set the material of the rendering quad.
	this.quad.material = this.bokehMaterial;

}

BokehPass.prototype = Object.create(Pass.prototype);
BokehPass.prototype.constructor = BokehPass;

/**
 * Renders the scene.
 *
 * @method render
 * @param {WebGLRenderer} renderer - The renderer to use.
 * @param {WebGLRenderTarget} writeBuffer - The write buffer.
 * @param {WebGLRenderTarget} readBuffer - The read buffer.
 * @param {Number} delta - The render delta time.
 * @param {Boolean} maskActive - Disable stencil test.
 */

BokehPass.prototype.render = function(renderer, writeBuffer, readBuffer, delta, maskActive) {

	// Render depth into texture.
	this.mainScene.overrideMaterial = this.depthMaterial;
	renderer.render(this.mainScene, this.mainCamera, this.renderTargetDepth, true);
	this.mainScene.overrideMaterial = null;

	// Render bokeh composite.
	this.bokehMaterial.uniforms.tColor.value = readBuffer;

	if(this.renderToScreen) {

		renderer.render(this.scene, this.camera);

	} else {

		renderer.render(this.scene, this.camera, writeBuffer, this.clear);

	}

};
