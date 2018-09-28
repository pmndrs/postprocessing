import {
	DepthStencilFormat,
	DepthTexture,
	LinearFilter,
	RGBAFormat,
	RGBFormat,
	UnsignedInt248Type,
	WebGLRenderTarget
} from "three";

import { ClearMaskPass, MaskPass, RenderPass, ShaderPass } from "../passes";
import { CopyMaterial } from "../materials";

/**
 * The EffectComposer may be used in place of a normal WebGLRenderer.
 *
 * The auto clear behaviour of the provided renderer will be disabled to prevent
 * unnecessary clear operations.
 *
 * It is common practice to use a {@link RenderPass} as the first pass to
 * automatically clear the screen and render the scene to a texture for further
 * processing.
 *
 * @implements {Resizable}
 * @implements {Disposable}
 */

export class EffectComposer {

	/**
	 * Constructs a new effect composer.
	 *
	 * @param {WebGLRenderer} [renderer] - The renderer that should be used.
	 * @param {Object} [options] - The options.
	 * @param {Boolean} [options.depthBuffer=true] - Whether the main render targets should have a depth buffer.
	 * @param {Boolean} [options.stencilBuffer=false] - Whether the main render targets should have a stencil buffer.
	 */

	constructor(renderer = null, options = {}) {

		const settings = Object.assign({
			depthBuffer: true,
			stencilBuffer: false
		}, options);

		/**
		 * The renderer.
		 *
		 * You may replace the renderer at any time by using
		 * {@link EffectComposer#replaceRenderer}.
		 *
		 * @type {WebGLRenderer}
		 */

		this.renderer = renderer;

		/**
		 * The input buffer.
		 *
		 * Reading from and writing to the same render target should be avoided.
		 * Therefore, two seperate yet identical buffers are used.
		 *
		 * @type {WebGLRenderTarget}
		 * @private
		 */

		this.inputBuffer = null;

		/**
		 * The output buffer.
		 *
		 * @type {WebGLRenderTarget}
		 * @private
		 */

		this.outputBuffer = null;

		if(this.renderer !== null) {

			this.renderer.autoClear = false;
			this.inputBuffer = this.createBuffer(settings.depthBuffer, settings.stencilBuffer);
			this.outputBuffer = this.inputBuffer.clone();

		}

		/**
		 * A copy pass used for copying masked scenes.
		 *
		 * @type {ShaderPass}
		 * @private
		 */

		this.copyPass = new ShaderPass(new CopyMaterial());

		/**
		 * The passes.
		 *
		 * @type {Pass[]}
		 * @private
		 */

		this.passes = [];

	}

	/**
	 * Replaces the current renderer with the given one. The DOM element of the
	 * current renderer will automatically be removed from its parent node and the
	 * DOM element of the new renderer will take its place.
	 *
	 * The auto clear mechanism of the provided renderer will be disabled.
	 *
	 * @param {WebGLRenderer} renderer - The new renderer.
	 * @return {WebGLRenderer} The old renderer.
	 */

	replaceRenderer(renderer) {

		const oldRenderer = this.renderer;

		let parent, oldSize, newSize;

		if(oldRenderer !== null && oldRenderer !== renderer) {

			this.renderer = renderer;
			this.renderer.autoClear = false;

			parent = oldRenderer.domElement.parentNode;
			oldSize = oldRenderer.getSize();
			newSize = renderer.getSize();

			if(parent !== null) {

				parent.removeChild(oldRenderer.domElement);
				parent.appendChild(renderer.domElement);

			}

			if(oldSize.width !== newSize.width || oldSize.height !== newSize.height) {

				this.setSize();

			}

		}

		return oldRenderer;

	}

	/**
	 * Retrieves the most relevant depth texture for the pass at the given index.
	 *
	 * @private
	 * @param {Number} index - The index of the pass that needs a depth texture.
	 * @return {DepthTexture} The depth texture, or null if there is none.
	 */

	getDepthTexture(index) {

		const passes = this.passes;

		let depthTexture = null;
		let inputBuffer = true;
		let i, pass;

		for(i = 0; i < index; ++i) {

			pass = passes[i];

			if(pass.needsSwap) {

				inputBuffer = !inputBuffer;

			} else if(pass instanceof RenderPass) {

				depthTexture = (inputBuffer ? this.inputBuffer : this.outputBuffer).depthTexture;

			}

		}

		return depthTexture;

	}

	/**
	 * Creates two depth texture attachments, one for the input buffer and one for
	 * the output buffer.
	 *
	 * Depth will be written to the depth texture when something is rendered into
	 * the respective render target and the involved materials have `depthWrite`
	 * enabled. Under normal circumstances, only a {@link RenderPass} will render
	 * depth.
	 *
	 * When a shader reads from a depth texture and writes to a render target that
	 * uses the same depth texture attachment, the depth information will be lost.
	 * This happens even if `depthWrite` is disabled. For that reason, two
	 * separate depth textures are used.
	 *
	 * @private
	 */

	createDepthTexture() {

		const depthTexture = new DepthTexture();

		if(this.inputBuffer.stencilBuffer) {

			depthTexture.format = DepthStencilFormat;
			depthTexture.type = UnsignedInt248Type;

		}

		this.inputBuffer.depthTexture = depthTexture;
		this.outputBuffer.depthTexture = depthTexture.clone();

	}

	/**
	 * Creates a new render target by replicating the renderer's canvas.
	 *
	 * The created render target uses a linear filter for texel minification and
	 * magnification. Its render texture format depends on whether the renderer
	 * uses the alpha channel. Mipmaps are disabled.
	 *
	 * @param {Boolean} depthBuffer - Whether the render target should have a depth buffer.
	 * @param {Boolean} stencilBuffer - Whether the render target should have a stencil buffer.
	 * @return {WebGLRenderTarget} A new render target that equals the renderer's canvas.
	 */

	createBuffer(depthBuffer, stencilBuffer) {

		const drawingBufferSize = this.renderer.getDrawingBufferSize();
		const alpha = this.renderer.context.getContextAttributes().alpha;

		const renderTarget = new WebGLRenderTarget(drawingBufferSize.width, drawingBufferSize.height, {
			minFilter: LinearFilter,
			magFilter: LinearFilter,
			format: alpha ? RGBAFormat : RGBFormat,
			depthBuffer: depthBuffer,
			stencilBuffer: stencilBuffer
		});

		renderTarget.texture.name = "EffectComposer.Buffer";
		renderTarget.texture.generateMipmaps = false;

		return renderTarget;

	}

	/**
	 * Adds a pass, optionally at a specific index.
	 *
	 * @param {Pass} pass - A new pass.
	 * @param {Number} [index] - An index at which the pass should be inserted.
	 */

	addPass(pass, index) {

		const renderer = this.renderer;
		const drawingBufferSize = renderer.getDrawingBufferSize();

		pass.setSize(drawingBufferSize.width, drawingBufferSize.height);
		pass.initialize(renderer, renderer.context.getContextAttributes().alpha);

		if(index !== undefined) {

			this.passes.splice(index, 0, pass);

		} else {

			index = this.passes.push(pass) - 1;

		}

		if(pass.needsDepthTexture) {

			if(this.inputBuffer.depthTexture === null) {

				this.createDepthTexture();

			}

			pass.setDepthTexture(this.getDepthTexture(index));

		}

	}

	/**
	 * Removes a pass.
	 *
	 * @param {Pass} pass - The pass.
	 */

	removePass(pass) {

		this.passes.splice(this.passes.indexOf(pass), 1);

	}

	/**
	 * Renders all enabled passes in the order in which they were added.
	 *
	 * @param {Number} delta - The time between the last frame and the current one in seconds.
	 */

	render(delta) {

		const renderer = this.renderer;
		const copyPass = this.copyPass;

		let inputBuffer = this.inputBuffer;
		let outputBuffer = this.outputBuffer;

		let stencilTest = false;
		let context, state, buffer;

		for(const pass of this.passes) {

			if(pass.enabled) {

				pass.render(renderer, inputBuffer, outputBuffer, delta, stencilTest);

				if(pass.needsSwap) {

					if(stencilTest) {

						copyPass.renderToScreen = pass.renderToScreen;

						context = renderer.context;
						state = renderer.state;

						// Preserve the unaffected pixels.
						state.buffers.stencil.setFunc(context.NOTEQUAL, 1, 0xffffffff);
						copyPass.render(renderer, inputBuffer, outputBuffer, delta, stencilTest);
						state.buffers.stencil.setFunc(context.EQUAL, 1, 0xffffffff);

					}

					buffer = inputBuffer;
					inputBuffer = outputBuffer;
					outputBuffer = buffer;

				}

				if(pass instanceof MaskPass) {

					stencilTest = true;

				} else if(pass instanceof ClearMaskPass) {

					stencilTest = false;

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
	 * @param {Number} [width] - The width.
	 * @param {Number} [height] - The height.
	 */

	setSize(width, height) {

		const renderer = this.renderer;

		let size, drawingBufferSize;

		if(width === undefined || height === undefined) {

			size = renderer.getSize();
			width = size.width; height = size.height;

		}

		// Update the logical render size.
		renderer.setSize(width, height);

		// The drawing buffer size takes the device pixel ratio into account.
		drawingBufferSize = renderer.getDrawingBufferSize();

		this.inputBuffer.setSize(drawingBufferSize.width, drawingBufferSize.height);
		this.outputBuffer.setSize(drawingBufferSize.width, drawingBufferSize.height);

		for(const pass of this.passes) {

			pass.setSize(drawingBufferSize.width, drawingBufferSize.height);

		}

	}

	/**
	 * Resets this composer by deleting all passes and creating new buffers.
	 */

	reset() {

		const renderTarget = this.createBuffer(
			this.inputBuffer.depthBuffer,
			this.inputBuffer.stencilBuffer
		);

		this.dispose();

		// Reanimate.
		this.inputBuffer = renderTarget;
		this.outputBuffer = renderTarget.clone();
		this.copyPass = new ShaderPass(new CopyMaterial());

	}

	/**
	 * Destroys this composer and all passes.
	 *
	 * This method deallocates all disposable objects created by the passes. It
	 * also deletes the main frame buffers of this composer.
	 */

	dispose() {

		for(const pass of this.passes) {

			pass.dispose();

		}

		this.passes = [];

		if(this.inputBuffer !== null) {

			this.inputBuffer.dispose();
			this.inputBuffer = null;

		}

		if(this.outputBuffer !== null) {

			this.outputBuffer.dispose();
			this.outputBuffer = null;

		}

		this.copyPass.dispose();

	}

}
