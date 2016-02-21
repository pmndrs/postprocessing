import { FilmMaterial } from "../materials";
import { Pass } from "./pass";
import THREE from "three";

/**
 * A film pass providing scan lines, greyscale and noise effects.
 *
 * @class FilmPass
 * @constructor
 * @extends Pass
 * @param {Object} [options] - The options.
 * @param {Boolean} [options.grayscale=true] - Convert to greyscale.
 * @param {Number} [options.noiseIntensity=0.5] - The noise intensity. 0.0 to 1.0.
 * @param {Number} [options.scanlinesIntensity=0.05] - The scanline intensity. 0.0 to 1.0.
 * @param {Number} [options.scanlines=1.0] - The number of scanlines in percent, relative to the screen height.
 */

export function FilmPass(options) {

	Pass.call(this);

	if(options === undefined) { options = {}; }

	/**
	 * Film shader material.
	 *
	 * @property material
	 * @type FilmMaterial
	 * @private
	 */

	this.material = new FilmMaterial();

	if(options !== undefined) {

		if(options.grayscale !== undefined) { this.material.uniforms.grayscale.value = options.grayscale; }
		if(options.noiseIntensity !== undefined) { this.material.uniforms.nIntensity.value = options.noiseIntensity; }
		if(options.scanlinesIntensity !== undefined) { this.material.uniforms.sIntensity.value = options.scanlinesIntensity; }

	}

	/**
	 * The amount of scanlines in percent, relative to the screen height.
	 *
	 * You need to call the reset method of the EffectComposer after 
	 * changing this value.
	 *
	 * @property scanlines
	 * @type Number
	 */

	this.scanlines = (options.scanlines === undefined) ? 1.0 : options.scanlines;

	// Set the material of the rendering quad once.
	this.quad.material = this.material;

	// Swap read and write buffer when done.
	this.needsSwap = true;

}

FilmPass.prototype = Object.create(Pass.prototype);
FilmPass.prototype.constructor = FilmPass;

/**
 * Renders the scene.
 *
 * @method render
 * @param {WebGLRenderer} renderer - The renderer to use.
 * @param {WebGLRenderTarget} writeBuffer - The write buffer.
 * @param {WebGLRenderTarget} readBuffer - The read buffer.
 * @param {Number} delta - The render delta time.
 */

FilmPass.prototype.render = function(renderer, writeBuffer, readBuffer, delta) {

	this.material.uniforms.tDiffuse.value = readBuffer;
	this.material.uniforms.time.value += delta;

	if(this.renderToScreen) {

		renderer.render(this.scene, this.camera);

	} else {

		renderer.render(this.scene, this.camera, writeBuffer, false);

	}

};

/**
 * Updates this pass with the main render target's size.
 *
 * @method setSize
 * @param {Number} width - The width.
 * @param {Number} height - The height.
 */

FilmPass.prototype.setSize = function(width, height) {

	this.material.uniforms.sCount.value = Math.floor(height * this.scanlines);

};
