import { CopyMaterial } from "./materials";
import { ShaderPass, MaskPass, ClearMaskPass } from "./passes";
import THREE from "three";

/**
 * The EffectComposer may be used in place of a normal WebGLRenderer.
 *
 * The composer will disable the auto clear behaviour of the provided 
 * renderer in order to prevent unnecessary clear operations.
 *
 * You may want to use a RenderPass as your first pass to automatically 
 * clear the screen and render the scene to a texture for further processing. 
 *
 * @class EffectComposer
 * @constructor
 * @param {WebGLRenderer} [renderer] - The pre-configured renderer that should be used for rendering the passes.
 * @param {WebGLRenderTarget} [renderTarget] - A pre-configured render target to use for the post processing.
 */

export function EffectComposer(renderer, renderTarget) {

	let pixelRatio, width, height;

	/**
	 * The renderer.
	 *
	 * @property renderer
	 * @type WebGLRenderer
	 */

	this.renderer = (renderer !== undefined) ? renderer : new THREE.WebGLRenderer();
	this.renderer.autoClear = false;

	/**
	 * The render target.
	 *
	 * @property renderTarget1
	 * @type WebGLRenderTarget
	 * @private
	 */

	if(renderTarget === undefined) {

		pixelRatio = this.renderer.getPixelRatio();
		width = Math.floor(this.renderer.context.canvas.width / pixelRatio) || 1;
		height = Math.floor(this.renderer.context.canvas.height / pixelRatio) || 1;

		renderTarget = new THREE.WebGLRenderTarget(width, height, {
			minFilter: THREE.LinearFilter,
			magFilter: THREE.LinearFilter,
			format: THREE.RGBFormat,
			stencilBuffer: false
		});

	}

	this.renderTarget1 = renderTarget;

	/**
	 * A copy of the render target.
	 *
	 * @property renderTarget2
	 * @type WebGLRenderTarget
	 * @private
	 */

	this.renderTarget2 = renderTarget.clone();

	/**
	 * The write buffer.
	 *
	 * @property writeBuffer
	 * @type WebGLRenderTarget
	 * @private
	 */

	this.writeBuffer = this.renderTarget1;

	/**
	 * The read buffer.
	 *
	 * @property readBuffer
	 * @type WebGLRenderTarget
	 * @private
	 */

	this.readBuffer = this.renderTarget2;

	/**
	 * The render passes.
	 *
	 * @property passes
	 * @type Array
	 * @private
	 */

	this.passes = [];

	/**
	 * A copy pass.
	 *
	 * @property copyPass
	 * @type ShaderPass
	 * @private
	 */

	this.copyPass = new ShaderPass(new CopyMaterial());

}

/**
 * Adds another pass.
 *
 * @method addPass
 * @param {Pass} pass - A new pass.
 */

EffectComposer.prototype.addPass = function(pass) {

	pass.setSize(this.renderTarget1.width, this.renderTarget1.height);
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

	pass.setSize(this.renderTarget1.width, this.renderTarget1.height);
	this.passes.splice(index, 0, pass);

};

/**
 * Swaps the render targets on demand.
 * You can toggle swapping in your pass by setting the needsSwap flag.
 *
 * @method swapBuffers
 * @private
 */

EffectComposer.prototype.swapBuffers = function() {

	var tmp = this.readBuffer;
	this.readBuffer = this.writeBuffer;
	this.writeBuffer = tmp;

};

/**
 * Renders all passes in order.
 *
 * @method render
 * @param {Number} delta - The delta time between the last frame and the current one.
 */

EffectComposer.prototype.render = function(delta) {

	this.writeBuffer = this.renderTarget1;
	this.readBuffer = this.renderTarget2;

	let maskActive = false;
	let i, l, pass, context;

	for(i = 0, l = this.passes.length; i < l; ++i) {

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
 * Resets the composer's render textures.
 *
 * Call this method when the size of the renderer's canvas has changed or
 * if you want to drop the old read/write buffers and create new ones.
 *
 * @method reset
 * @param {WebGLRenderTarget} [renderTarget] - A new render target to use.
 */

EffectComposer.prototype.reset = function(renderTarget) {

	let pixelRatio, width, height;

	if(renderTarget === undefined) {

		renderTarget = this.renderTarget1.clone();

		pixelRatio = this.renderer.getPixelRatio();
		width = Math.floor(this.renderer.context.canvas.width / pixelRatio);
		height = Math.floor(this.renderer.context.canvas.height / pixelRatio);

	} else {

		width = renderTarget.width;
		height = renderTarget.height;

	}

	this.renderTarget1.dispose();
	this.renderTarget1 = renderTarget;
	this.renderTarget2.dispose();
	this.renderTarget2 = renderTarget.clone();

	this.writeBuffer = this.renderTarget1;
	this.readBuffer = this.renderTarget2;

	this.setSize(width, height);

};

/**
 * Sets the render size.
 *
 * @method setSize
 * @param {Number} width - The width.
 * @param {Number} height - The height.
 */

EffectComposer.prototype.setSize = function(width, height) {

	let i, l;

	this.renderTarget1.setSize(width, height);
	this.renderTarget2.setSize(width, height);

	// Let all passes adjust to the new size.
	for(i = 0, l = this.passes.length; i < l; ++i) {

		this.passes[i].setSize(width, height);

	}

};

/**
 * Destroys all passes and render targets.
 *
 * This method deallocates any render targets, textures and materials created by the passes.
 * It also deletes this composer's render targets and copy material.
 *
 * @method dispose
 */

EffectComposer.prototype.dispose = function(width, height) {

	this.renderTarget1.dispose();
	this.renderTarget2.dispose();
	this.copyPass.dispose();

	this.renderTarget1 = null;
	this.renderTarget2 = null;
	this.copyPass = null;

	while(this.passes.length > 0) {

		this.passes.pop().dispose();

	}

};
