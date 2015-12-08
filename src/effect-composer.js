import { CopyMaterial } from "./materials";
import { ShaderPass, MaskPass, ClearMaskPass } from "./passes";
import THREE from "three";

/**
 * The effect composer may be used in place of a common 
 * WebGLRenderer inside of the main render loop.
 *
 * @class EffectComposer
 * @constructor
 * @param {WebGLRenderer} renderer - The renderer that should be used to display the effects.
 * @param {WebGLRenderTarget} [renderTarget] - A render target to use for the post processing.
 */

export function EffectComposer(renderer, renderTarget) {

	/**
	 * The renderer.
	 *
	 * @property renderer
	 * @type {WebGLRenderer}
	 */

	this.renderer = renderer;

	/**
	 * The render target.
	 *
	 * @property renderTarget1
	 * @type {WebGLRenderTarget}
	 */

	if(renderTarget === undefined) {

		var pixelRatio = renderer.getPixelRatio();

		var width  = Math.floor(renderer.context.canvas.width  / pixelRatio) || 1;
		var height = Math.floor(renderer.context.canvas.height / pixelRatio) || 1;
		var parameters = {minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBFormat, stencilBuffer: false};

		renderTarget = new THREE.WebGLRenderTarget(width, height, parameters);

	}

	this.renderTarget1 = renderTarget;

	/**
	 * A copy of the render target.
	 *
	 * @property renderTarget2
	 * @type {WebGLRenderTarget}
	 */

	this.renderTarget2 = renderTarget.clone();

	/**
	 * The write buffer. Alias for renderTarget1.
	 *
	 * @property writeBuffer
	 * @type {WebGLRenderTarget}
	 */

	this.writeBuffer = this.renderTarget1;

	/**
	 * The read buffer. Alias for renderTarget2.
	 *
	 * @property readBuffer
	 * @type {WebGLRenderTarget}
	 */

	this.readBuffer = this.renderTarget2;

	/**
	 * The render passes.
	 *
	 * @property passes
	 * @type {Array}
	 */

	this.passes = [];

	/**
	 * A copy pass.
	 *
	 * @property copyPass
	 * @type {ShaderPass}
	 */

	this.copyPass = new ShaderPass(new CopyMaterial());

}

/**
 * Swaps the render targets on demand.
 *
 * @method swapBuffers
 */

EffectComposer.prototype.swapBuffers = function() {

	var tmp = this.readBuffer;
	this.readBuffer = this.writeBuffer;
	this.writeBuffer = tmp;

};

/**
 * Adds another render pass.
 *
 * @method addPass
 * @param {Pass} pass - A new render pass.
 */

EffectComposer.prototype.addPass = function(pass) {

	this.passes.push(pass);

};

/**
 * Inserts a new pass at a specific index.
 *
 * @method insertPass
 * @param {Pass} pass - The pass.
 * @param {Number} index - The index.
 */

EffectComposer.prototype.insertPass = function(pass, index) {

	this.passes.splice(index, 0, pass);

};

/**
 * Renders all passes in order.
 *
 * @method render
 * @param {Number} delta - The render delta time.
 */

EffectComposer.prototype.render = function(delta) {

	this.writeBuffer = this.renderTarget1;
	this.readBuffer = this.renderTarget2;

	var context, pass;
	var maskActive = false;
	var i, il;

	for(i = 0, il = this.passes.length; i < il; ++i) {

		pass = this.passes[i];

		if(pass.enabled) {

			pass.render(this.renderer, this.writeBuffer, this.readBuffer, delta, maskActive);

			if(pass.needsSwap) {

				if(maskActive) {

					context = this.renderer.context;
					context.stencilFunc(context.NOTEQUAL, 1, 0xffffffff);
					this.copyPass.render(this.renderer, this.writeBuffer, this.readBuffer, delta);
					context.stencilFunc(context.EQUAL, 1, 0xffffffff);

				}

				this.swapBuffers();

			}

			if(pass instanceof MaskPass) {

				maskActive = true;

			} else if(pass instanceof ClearMaskPass) {

				maskActive = false;

			}

		}

	}

};

/**
 * Resets the composer.
 *
 * @method reset
 * @param {WebGLRenderTarget} renderTarget - A new render target to use.
 */

EffectComposer.prototype.reset = function(renderTarget) {

	var pixelRatio;

	if(renderTarget === undefined) {

		renderTarget = this.renderTarget1.clone();

		pixelRatio = this.renderer.getPixelRatio();

		renderTarget.width = Math.floor(this.renderer.context.canvas.width / pixelRatio);
		renderTarget.height = Math.floor(this.renderer.context.canvas.height / pixelRatio);

	}

	this.renderTarget1.dispose();
	this.renderTarget1 = renderTarget;
	this.renderTarget2.dispose();
	this.renderTarget2 = renderTarget.clone();

	this.writeBuffer = this.renderTarget1;
	this.readBuffer = this.renderTarget2;

};

/**
 * Sets the render size.
 *
 * @method setSize
 * @param {Number} width - The width.
 * @param {Number} height - The height.
 */

EffectComposer.prototype.setSize = function(width, height) {

	this.renderTarget1.setSize(width, height);
	this.renderTarget2.setSize(width, height);

};
