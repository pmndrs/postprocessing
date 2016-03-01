import { MaskPass, ClearMaskPass } from "./passes";
import THREE from "three";

/**
 * The EffectComposer may be used in place of a normal WebGLRenderer.
 *
 * It will disable the auto clear behaviour of the provided renderer to prevent 
 * unnecessary clear operations.
 *
 * You may want to use a RenderPass as your first pass to automatically clear 
 * the screen and render the scene to a texture for further processing. 
 *
 * @class EffectComposer
 * @constructor
 * @param {WebGLRenderer} [renderer] - A renderer that should be used for rendering the passes.
 * @param {WebGLRenderTarget} [renderTarget] - A pre-configured render target to use as a read/write buffer.
 */

export function EffectComposer(renderer, renderTarget) {

	let pixelRatio, width, height, alpha;

	/**
	 * The renderer.
	 *
	 * @property renderer
	 * @type WebGLRenderer
	 */

	this.renderer = (renderer !== undefined) ? renderer : new THREE.WebGLRenderer();
	this.renderer.autoClear = false;

	/**
	 * The read/write buffer.
	 *
	 * @property buffer
	 * @type WebGLRenderTarget
	 * @private
	 */

	if(renderTarget === undefined) {

		pixelRatio = this.renderer.getPixelRatio();
		width = Math.floor(this.renderer.context.canvas.width / pixelRatio) || 1;
		height = Math.floor(this.renderer.context.canvas.height / pixelRatio) || 1;
		alpha = this.renderer.context.getContextAttributes().alpha;

		renderTarget = new THREE.WebGLRenderTarget(width, height, {
			minFilter: THREE.LinearFilter,
			magFilter: THREE.LinearFilter,
			format: alpha ? THREE.RGBAFormat : THREE.RGBFormat
		});

	}

	this.buffer = renderTarget;

	/**
	 * The render passes.
	 *
	 * @property passes
	 * @type Array
	 * @private
	 */

	this.passes = [];

}

/**
 * Adds a pass, optionally at a specific index.
 *
 * @method addPass
 * @param {Pass} pass - A new pass.
 * @param {Number} [index] - An index at which the pass should be inserted.
 */

EffectComposer.prototype.addPass = function(pass, index) {

	if(this.buffer !== null) {

		pass.setSize(this.buffer.width, this.buffer.height);

		if(index !== undefined) {

			this.passes.splice(index, 0, pass);

		}	else {

			this.passes.push(pass);

		}

	}

};

/**
 * Removes a pass.
 *
 * @method removePass
 * @param {Pass} pass - The pass.
 */

EffectComposer.prototype.removePass = function(pass) {

	this.passes.splice(this.passes.indexOf(pass), 1);

};

/**
 * Renders all passes in order.
 *
 * @method render
 * @param {Number} delta - The time between the last frame and the current one.
 */

EffectComposer.prototype.render = function(delta) {

	let maskActive = false;
	let i, l, pass;

	for(i = 0, l = this.passes.length; i < l; ++i) {

		pass = this.passes[i];

		if(pass.enabled) {

			pass.render(this.renderer, this.buffer, delta, maskActive);

			if(pass instanceof MaskPass) {

				maskActive = true;

			} else if(pass instanceof ClearMaskPass) {

				maskActive = false;

			}

		}

	}

};

/**
 * Sets the size of the render targets and the output canvas.
 *
 * Every pass will be informed of the new size. It's up to each pass 
 * how that information will be handled.
 *
 * If no width or height is specified, the render targets and passes 
 * will be updated with the current size.
 *
 * @method setSize
 * @param {Number} [width] - The width.
 * @param {Number} [height] - The height.
 */

EffectComposer.prototype.setSize = function(width, height) {

	let i, l;

	if(width === undefined) { width = this.buffer.width; }
	if(height === undefined) { height = this.buffer.height; }

	this.renderer.setSize(width, height);
	this.buffer.setSize(width, height);

	for(i = 0, l = this.passes.length; i < l; ++i) {

		this.passes[i].setSize(width, height);

	}

};

/**
 * Resets this composer by deleting all registered passes 
 * and creating a new buffer.
 *
 * @method reset
 * @param {WebGLRenderTarget} [renderTarget] - A new render target to use. If none is provided, the settings of the old buffer will be used.
 */

EffectComposer.prototype.reset = function(renderTarget) {

	this.dispose((renderTarget === undefined) ? this.buffer.clone() : renderTarget);

};

/**
 * Destroys all passes and render targets.
 *
 * This method deallocates all render targets, textures and materials created by the passes.
 * It also deletes this composer's frame buffer.
 *
 * Note: the reset method uses the dispose method internally.
 *
 * @method dispose
 * @param {WebGLRenderTarget} [renderTarget] - A new render target. If none is provided, the composer will become inoperative.
 */

EffectComposer.prototype.dispose = function(renderTarget) {

	this.buffer.dispose();
	this.buffer = (renderTarget !== undefined) ? renderTarget : null;

	while(this.passes.length > 0) {

		this.passes.pop().dispose();

	}

};
