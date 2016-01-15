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

	Pass.call(this, scene, camera);

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
		format: THREE.RGBFormat
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
	 * A scene to render the depth of field with.
	 *
	 * @property scene2
	 * @type Scene
	 * @private
	 */

	this.scene2  = new THREE.Scene();

	/**
	 * A camera to render the depth of field effect with.
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

	this.quad = new THREE.Mesh(new THREE.PlaneBufferGeometry(2, 2), this.bokehMaterial);
	this.scene2.add(this.quad);

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
	this.scene.overrideMaterial = this.depthMaterial;
	renderer.render(this.scene, this.camera, this.renderTargetDepth, true);
	this.scene.overrideMaterial = null;

	// Render bokeh composite.
	this.bokehMaterial.uniforms.tColor.value = readBuffer;

	if(this.renderToScreen) {

		renderer.render(this.scene2, this.camera2);

	} else {

		renderer.render(this.scene2, this.camera2, writeBuffer, this.clear);

	}

};
