import {
	DepthStencilFormat,
	DepthTexture,
	LinearFilter,
	RGBAFormat,
	RGBFormat,
	UnsignedInt248Type,
	Vector2,
	WebGLRenderTarget
} from "three";

import { ClearMaskPass, MaskPass, ShaderPass } from "../passes";
import { CopyMaterial } from "../materials";

/**
 * The EffectComposer may be used in place of a normal WebGLRenderer.
 *
 * The auto clear behaviour of the provided renderer will be disabled to prevent
 * unnecessary clear operations.
 *
 * It is common practice to use a {@link RenderPass} as the first pass to
 * automatically clear the buffers and render a scene for further processing.
 *
 * @implements {Resizable}
 * @implements {Disposable}
 */

export class EffectComposer {

	/**
	 * Constructs a new effect composer.
	 *
	 * @param {WebGLRenderer} renderer - The renderer that should be used.
	 * @param {Object} [options] - The options.
	 * @param {Boolean} [options.depthBuffer=true] - Whether the main render targets should have a depth buffer.
	 * @param {Boolean} [options.stencilBuffer=false] - Whether the main render targets should have a stencil buffer.
	 */

	constructor(renderer = null, { depthBuffer = true, stencilBuffer = false } = {}) {

		/**
		 * The renderer.
		 *
		 * You may replace the renderer at any time by using
		 * {@link EffectComposer#replaceRenderer}.
		 *
		 * @type {WebGLRenderer}
		 * @private
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
			this.inputBuffer = this.createBuffer(depthBuffer, stencilBuffer);
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
		 * A depth texture.
		 *
		 * @type {DepthTexture}
		 * @private
		 */

		this.depthTexture = null;

		/**
		 * The passes.
		 *
		 * @type {Pass[]}
		 * @private
		 */

		this.passes = [];

	}

	/**
	 * Returns the WebGL renderer.
	 *
	 * @return {WebGLRenderer} The renderer.
	 */

	getRenderer() {

		return this.renderer;

	}

	/**
	 * Replaces the current renderer with the given one.
	 *
	 * The auto clear mechanism of the provided renderer will be disabled. If the
	 * new render size differs from the previous one, all passes will be updated.
	 *
	 * By default, the DOM element of the current renderer will automatically be
	 * removed from its parent node and the DOM element of the new renderer will
	 * take its place.
	 *
	 * @param {WebGLRenderer} renderer - The new renderer.
	 * @param {Boolean} updateDOM - Indicates whether the old canvas should be replaced by the new one in the DOM.
	 * @return {WebGLRenderer} The old renderer.
	 */

	replaceRenderer(renderer, updateDOM = true) {

		const oldRenderer = this.renderer;

		if(oldRenderer !== null && oldRenderer !== renderer) {

			const oldSize = oldRenderer.getSize(new Vector2());
			const newSize = renderer.getSize(new Vector2());
			const parent = oldRenderer.domElement.parentNode;

			this.renderer = renderer;
			this.renderer.autoClear = false;

			if(!oldSize.equals(newSize)) {

				this.setSize();

			}

			if(updateDOM && parent !== null) {

				parent.removeChild(oldRenderer.domElement);
				parent.appendChild(renderer.domElement);

			}

		}

		return oldRenderer;

	}

	/**
	 * Creates a depth texture attachment that will be provided to all passes.
	 *
	 * Note: When a shader reads from a depth texture and writes to a render
	 * target that uses the same depth texture attachment, the depth information
	 * will be lost. This happens even if `depthWrite` is disabled.
	 *
	 * @private
	 * @return {DepthTexture} The depth texture.
	 */

	createDepthTexture() {

		const depthTexture = this.depthTexture = new DepthTexture();

		if(this.inputBuffer.stencilBuffer) {

			depthTexture.format = DepthStencilFormat;
			depthTexture.type = UnsignedInt248Type;

		}

		return depthTexture;

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

		const drawingBufferSize = this.renderer.getDrawingBufferSize(new Vector2());
		const alpha = this.renderer.getContext().getContextAttributes().alpha;

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

		const passes = this.passes;
		const renderer = this.renderer;
		const drawingBufferSize = renderer.getDrawingBufferSize(new Vector2());

		pass.setSize(drawingBufferSize.width, drawingBufferSize.height);
		pass.initialize(renderer, renderer.getContext().getContextAttributes().alpha);

		if(index !== undefined) {

			passes.splice(index, 0, pass);

		} else {

			passes.push(pass);

		}

		if(pass.needsDepthTexture || this.depthTexture !== null) {

			if(this.depthTexture === null) {

				const depthTexture = this.createDepthTexture();

				for(pass of passes) {

					pass.setDepthTexture(depthTexture);

				}

			} else {

				pass.setDepthTexture(this.depthTexture);

			}

		}

	}

	/**
	 * Removes a pass.
	 *
	 * @param {Pass} pass - The pass.
	 */

	removePass(pass) {

		const passes = this.passes;
		const removed = (passes.splice(passes.indexOf(pass), 1).length > 0);

		if(removed && this.depthTexture !== null) {

			const reducer = (a, b) => a || b.needsDepthTexture;
			const depthTextureRequired = passes.reduce(reducer, false);

			if(!depthTextureRequired) {

				this.depthTexture.dispose();
				this.depthTexture = null;

				this.inputBuffer.depthTexture = null;
				this.outputBuffer.depthTexture = null;

				for(pass of passes) {

					pass.setDepthTexture(null);

				}

			}

		}

	}

	/**
	 * Renders all enabled passes in the order in which they were added.
	 *
	 * @param {Number} deltaTime - The time between the last frame and the current one in seconds.
	 */

	render(deltaTime) {

		const renderer = this.renderer;
		const copyPass = this.copyPass;

		let inputBuffer = this.inputBuffer;
		let outputBuffer = this.outputBuffer;

		let stencilTest = false;
		let context, stencil, buffer;

		for(const pass of this.passes) {

			if(pass.enabled) {

				pass.render(renderer, inputBuffer, outputBuffer, deltaTime, stencilTest);

				if(pass.needsSwap) {

					if(stencilTest) {

						copyPass.renderToScreen = pass.renderToScreen;
						context = renderer.getContext();
						stencil = renderer.state.buffers.stencil;

						// Preserve the unaffected pixels.
						stencil.setFunc(context.NOTEQUAL, 1, 0xffffffff);
						copyPass.render(renderer, inputBuffer, outputBuffer, deltaTime, stencilTest);
						stencil.setFunc(context.EQUAL, 1, 0xffffffff);

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

		if(width === undefined || height === undefined) {

			const size = renderer.getSize(new Vector2());
			width = size.width; height = size.height;

		}

		// Update the logical render size.
		renderer.setSize(width, height);

		// The drawing buffer size takes the device pixel ratio into account.
		const drawingBufferSize = renderer.getDrawingBufferSize(new Vector2());

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
		this.depthTexture = null;
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

		if(this.depthTexture !== null) {

			this.depthTexture.dispose();

		}

		this.copyPass.dispose();

	}

}
