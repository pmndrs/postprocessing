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
 * @param {Object} [params] - Additional parameters.
 * @param {Number} [params.focus] - The focus.
 * @param {Number} [params.aspect] - The aspect.
 * @param {Number} [params.aperture] - The aperture.
 * @param {Number} [params.maxBlur] - The maximum blur.
 * @param {Number} [params.resolution] - The render resolution.
 */

export function BokehPass(scene, camera, params) {

	Pass.call(this, scene, camera);

	// Defaults.
	var focus = (params.focus !== undefined) ? params.focus : 1.0;
	var aspect = (params.aspect !== undefined) ? params.aspect : camera.aspect;
	var aperture = (params.aperture !== undefined) ? params.aperture : 0.025;
	var maxBlur = (params.maxBlur !== undefined) ? params.maxBlur : 1.0;
	var resolution = (params.resolution !== undefined) ? resolution : 256;

	/**
	 * A render target.
	 *
	 * @property renderTargetColor
	 * @type {WebGLRenderTarget}
	 */

	this.renderTargetColor = new THREE.WebGLRenderTarget(resolution, resolution, {
		minFilter: THREE.LinearFilter,
		magFilter: THREE.LinearFilter,
		format: THREE.RGBFormat
	});

	/**
	 * A render target for the depth.
	 *
	 * @property renderTargetDepth
	 * @type {WebGLRenderTarget}
	 */

	this.renderTargetDepth = this.renderTargetColor.clone();

	/**
	 * Depth shader material.
	 *
	 * @property depthMaterial
	 * @type {MeshDepthMaterial}
	 * @private
	 */

	this.depthMaterial = new THREE.MeshDepthMaterial();

	/**
	 * Bokeh shader material.
	 *
	 * @property bokehMaterial
	 * @type {BokehMaterial}
	 * @private
	 */

	this.bokehMaterial = new BokehMaterial();
	this.bokehMaterial.uniforms.tDepth.value = this.renderTargetDepth;
	this.bokehMaterial.uniforms.focus.value = focus;
	this.bokehMaterial.uniforms.aspect.value = aspect;
	this.bokehMaterial.uniforms.aperture.value = aperture;
	this.bokehMaterial.uniforms.maxBlur.value = maxBlur;

	/**
	 * Render to screen flag.
	 *
	 * @property renderToScreen
	 * @type {Boolean}
	 * @default false
	 */

	this.renderToScreen = false;

	// Don't clear in this pass.
	this.clear = false;

	/**
	 * A scene to render the second quad with.
	 *
	 * @property scene2
	 * @type {Scene}
	 */

	this.scene2  = new THREE.Scene();

	/**
	 * A camera to render the second quad with.
	 *
	 * @property camera2
	 * @type {Camera}
	 */

	this.camera2 = new THREE.OrthographicCamera( - 1, 1, 1, - 1, 0, 1 );

	/**
	 * Another quad mesh to render.
	 *
	 * @property quad2
	 * @type {Mesh}
	 */

	this.quad2 = new THREE.Mesh(new THREE.PlaneBufferGeometry(2, 2), null);
	this.scene2.add(this.quad2);

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

	this.quad2.material = this.bokehMaterial;

	// Render depth into texture.
	this.scene.overrideMaterial = this.depthMaterial;

	renderer.render(this.scene, this.camera, this.renderTargetDepth, true);

	// Render bokeh composite.
	this.bokehMaterial.uniforms.tColor.value = readBuffer;

	if(this.renderToScreen) {

		renderer.render(this.scene2, this.camera2);

	} else {

		renderer.render(this.scene2, this.camera2, writeBuffer, this.clear);

	}

	this.scene.overrideMaterial = null;

};
