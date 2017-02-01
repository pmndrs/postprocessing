import { DepthTexture, LinearFilter, RGBAFormat, RGBFormat, WebGLRenderer, WebGLRenderTarget } from "three";
import { ClearMaskPass, MaskPass, ShaderPass } from "../passes";
import { CopyMaterial } from "../materials";

/**
 * The EffectComposer may be used in place of a normal WebGLRenderer.
 *
 * It will disable the auto clear behaviour of the provided renderer to prevent
 * unnecessary clear operations. The depth buffer will also be disabled for
 * writing. Passes that rely on the depth test must explicitly enable it.
 *
 * You may want to use a {{#crossLink "RenderPass"}}{{/crossLink}} as your first
 * pass to automatically clear the screen and render the scene to a texture for
 * further processing.
 *
 * @class EffectComposer
 * @module postprocessing
 * @constructor
 * @param {WebGLRenderer} [renderer] - The renderer that should be used in the passes.
 * @param {Boolean} [depthTexture=false] - Set to true, if one of your passes relies on the depth of the main scene.
 * @param {Boolean} [stencilBuffer=false] - Whether the main render targets should have a stencil buffer.
 */

export class EffectComposer {

	constructor(renderer, depthTexture = false, stencilBuffer = false) {

		/**
		 * The renderer.
		 *
		 * @property renderer
		 * @type WebGLRenderer
		 */

		this.renderer = (renderer !== undefined) ? renderer : new WebGLRenderer();

		this.renderer.autoClear = false;
		this.renderer.state.setDepthWrite(false);

		/**
		 * The read buffer.
		 *
		 * Reading from and writing to the same render target should be avoided.
		 * Therefore, two seperate, yet identical buffers are used.
		 *
		 * @property readBuffer
		 * @type WebGLRenderTarget
		 * @private
		 */

		this.readBuffer = this.createBuffer(stencilBuffer);

		this.readBuffer.texture.generateMipmaps = false;

		/**
		 * The write buffer.
		 *
		 * @property writeBuffer
		 * @type WebGLRenderTarget
		 * @private
		 */

		this.writeBuffer = this.readBuffer.clone();

		if(depthTexture) {

			this.readBuffer.depthTexture = this.writeBuffer.depthTexture = new DepthTexture();

		}

		/**
		 * A copy pass used for copying masked scenes.
		 *
		 * @property copyPass
		 * @type ShaderPass
		 * @private
		 */

		this.copyPass = new ShaderPass(new CopyMaterial());

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
	 * Creates a new render target by replicating the renderer's canvas.
	 *
	 * @method createBuffer
	 * @param {Boolean} stencilBuffer - Whether the render target should have a stencil buffer.
	 * @return {WebGLRenderTarget} A fresh render target that equals the renderer's canvas.
	 */

	createBuffer(stencilBuffer) {

		const size = this.renderer.getSize();
		const pixelRatio = this.renderer.getPixelRatio();
		const alpha = this.renderer.context.getContextAttributes().alpha;

		return new WebGLRenderTarget(size.width * pixelRatio, size.height * pixelRatio, {
			minFilter: LinearFilter,
			magFilter: LinearFilter,
			format: alpha ? RGBAFormat : RGBFormat,
			stencilBuffer: stencilBuffer
		});

	}

	/**
	 * Adds a pass, optionally at a specific index.
	 *
	 * @method addPass
	 * @param {Pass} pass - A new pass.
	 * @param {Number} [index] - An index at which the pass should be inserted.
	 */

	addPass(pass, index) {

		pass.initialise(this.renderer, this.renderer.context.getContextAttributes().alpha);

		if(index !== undefined) {

			this.passes.splice(index, 0, pass);

		} else {

			this.passes.push(pass);

		}

	}

	/**
	 * Removes a pass.
	 *
	 * @method removePass
	 * @param {Pass} pass - The pass.
	 */

	removePass(pass) {

		this.passes.splice(this.passes.indexOf(pass), 1);

	}

	/**
	 * Renders all enabled passes in the order in which they were added.
	 *
	 * @method render
	 * @param {Number} delta - The time between the last frame and the current one in seconds.
	 */

	render(delta) {

		const passes = this.passes;
		const renderer = this.renderer;
		const copyPass = this.copyPass;

		let readBuffer = this.readBuffer;
		let writeBuffer = this.writeBuffer;

		let maskActive = false;
		let i, l, pass, buffer;
		let context, state;

		for(i = 0, l = passes.length; i < l; ++i) {

			pass = passes[i];

			if(pass.enabled) {

				pass.render(renderer, readBuffer, writeBuffer, delta, maskActive);

				if(pass.needsSwap) {

					if(maskActive) {

						context = renderer.context;
						state = renderer.state;
						state.setStencilFunc(context.NOTEQUAL, 1, 0xffffffff);
						copyPass.render(renderer, readBuffer, writeBuffer);
						state.setStencilFunc(context.EQUAL, 1, 0xffffffff);

					}

					buffer = readBuffer;
					readBuffer = writeBuffer;
					writeBuffer = buffer;

				}

				if(pass instanceof MaskPass) {

					maskActive = true;

				} else if(pass instanceof ClearMaskPass) {

					maskActive = false;

				}

			}

		}

	}

	/**
	 * Sets the size of the buffers and the renderer's output canvas.
	 *
	 * Every pass will be informed of the new size. It's up to each pass how that
	 * information is used.
	 *
	 * If no width or height is specified, the render targets and passes will be
	 * updated with the current size of the renderer.
	 *
	 * @method setSize
	 * @param {Number} [width] - The width.
	 * @param {Number} [height] - The height.
	 */

	setSize(width, height) {

		const passes = this.passes;
		const size = this.renderer.getSize();

		let i, l;

		if(width === undefined || height === undefined) {

			width = size.width;
			height = size.height;

		}

		this.renderer.setSize(width, height);
		this.readBuffer.setSize(width, height);
		this.writeBuffer.setSize(width, height);

		for(i = 0, l = passes.length; i < l; ++i) {

			passes[i].setSize(width, height);

		}

	}

	/**
	 * Resets this composer by deleting all passes and creating new buffers.
	 *
	 * @method reset
	 * @param {WebGLRenderTarget} [renderTarget] - A new render target to use. If none is provided, the settings of the renderer will be used.
	 */

	reset(renderTarget) {

		this.dispose((renderTarget === undefined) ? this.createBuffer() : renderTarget);

	}

	/**
	 * Destroys all passes and render targets.
	 *
	 * This method deallocates all render targets, textures and materials created
	 * by the passes. It also deletes this composer's frame buffers.
	 *
	 * Note: the reset method uses the dispose method internally.
	 *
	 * @method dispose
	 * @param {WebGLRenderTarget} [renderTarget] - A new render target. If none is provided, the composer will become inoperative.
	 */

	dispose(renderTarget) {

		const passes = this.passes;

		this.readBuffer.dispose();
		this.writeBuffer.dispose();

		this.readBuffer = this.writeBuffer = null;

		while(passes.length > 0) {

			passes.pop().dispose();

		}

		if(renderTarget !== undefined) {

			// Reanimate.
			this.readBuffer = renderTarget;
			this.writeBuffer = this.readBuffer.clone();

		} else {

			this.copyPass.dispose();

		}

	}

}
