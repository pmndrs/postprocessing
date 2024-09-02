import {
	DepthStencilFormat,
	DepthTexture,
	LinearFilter,
	SRGBColorSpace,
	UnsignedByteType,
	UnsignedIntType,
	UnsignedInt248Type,
	Vector2,
	WebGLRenderTarget
} from "three";

import { Timer } from "./Timer.js";
import { ClearMaskPass } from "../passes/ClearMaskPass.js";
import { CopyPass } from "../passes/CopyPass.js";
import { MaskPass } from "../passes/MaskPass.js";
import { Pass } from "../passes/Pass.js";

/**
 * The EffectComposer may be used in place of a normal WebGLRenderer.
 *
 * The auto clear behaviour of the provided renderer will be disabled to prevent unnecessary clear operations.
 *
 * It is common practice to use a {@link RenderPass} as the first pass to automatically clear the buffers and render a
 * scene for further processing.
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
	 * @param {Boolean} [options.alpha] - Deprecated. Buffers are always RGBA since three r137.
	 * @param {Number} [options.multisampling=0] - The number of samples used for multisample antialiasing. Requires WebGL 2.
	 * @param {Number} [options.frameBufferType] - The type of the internal frame buffers. It's recommended to use HalfFloatType if possible.
	 */

	constructor(renderer = null, {
		depthBuffer = true,
		stencilBuffer = false,
		multisampling = 0,
		frameBufferType
	} = {}) {

		/**
		 * The renderer.
		 *
		 * @type {WebGLRenderer}
		 * @private
		 */

		this.renderer = null;

		/**
		 * The input buffer.
		 *
		 * Two identical buffers are used to avoid reading from and writing to the same render target.
		 *
		 * @type {WebGLRenderTarget}
		 * @private
		 */

		this.inputBuffer = this.createBuffer(depthBuffer, stencilBuffer, frameBufferType, multisampling);

		/**
		 * The output buffer.
		 *
		 * @type {WebGLRenderTarget}
		 * @private
		 */

		this.outputBuffer = this.inputBuffer.clone();

		/**
		 * A copy pass used for copying masked scenes.
		 *
		 * @type {CopyPass}
		 * @private
		 */

		this.copyPass = new CopyPass();

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

		/**
		 * A timer.
		 *
		 * @type {Timer}
		 * @private
		 */

		this.timer = new Timer();

		/**
		 * Determines whether the last pass automatically renders to screen.
		 *
		 * @type {Boolean}
		 */

		this.autoRenderToScreen = true;

		this.setRenderer(renderer);

	}

	/**
	 * The current amount of samples used for multisample anti-aliasing.
	 *
	 * @type {Number}
	 */

	get multisampling() {

		// TODO Raise min three version to 138 and remove || 0.
		return this.inputBuffer.samples || 0;

	}

	/**
	 * Sets the amount of MSAA samples.
	 *
	 * Requires WebGL 2. Set to zero to disable multisampling.
	 *
	 * @type {Number}
	 */

	set multisampling(value) {

		const buffer = this.inputBuffer;
		const multisampling = this.multisampling;

		if(multisampling > 0 && value > 0) {

			this.inputBuffer.samples = value;
			this.outputBuffer.samples = value;
			this.inputBuffer.dispose();
			this.outputBuffer.dispose();

		} else if(multisampling !== value) {

			this.inputBuffer.dispose();
			this.outputBuffer.dispose();

			// Enable or disable MSAA.
			this.inputBuffer = this.createBuffer(
				buffer.depthBuffer,
				buffer.stencilBuffer,
				buffer.texture.type,
				value
			);

			this.inputBuffer.depthTexture = this.depthTexture;
			this.outputBuffer = this.inputBuffer.clone();

		}

	}

	/**
	 * Returns the internal timer.
	 *
	 * @return {Timer} The timer.
	 */

	getTimer() {

		return this.timer;

	}

	/**
	 * Returns the renderer.
	 *
	 * @return {WebGLRenderer} The renderer.
	 */

	getRenderer() {

		return this.renderer;

	}

	/**
	 * Sets the renderer.
	 *
	 * @param {WebGLRenderer} renderer - The renderer.
	 */

	setRenderer(renderer) {

		this.renderer = renderer;

		if(renderer !== null) {

			const size = renderer.getSize(new Vector2());
			const alpha = renderer.getContext().getContextAttributes().alpha;
			const frameBufferType = this.inputBuffer.texture.type;

			if(frameBufferType === UnsignedByteType && renderer.outputColorSpace === SRGBColorSpace) {

				this.inputBuffer.texture.colorSpace = SRGBColorSpace;
				this.outputBuffer.texture.colorSpace = SRGBColorSpace;

				this.inputBuffer.dispose();
				this.outputBuffer.dispose();

			}

			renderer.autoClear = false;
			this.setSize(size.width, size.height);

			for(const pass of this.passes) {

				pass.initialize(renderer, alpha, frameBufferType);

			}

		}

	}

	/**
	 * Replaces the current renderer with the given one.
	 *
	 * The auto clear mechanism of the provided renderer will be disabled. If the new render size differs from the
	 * previous one, all passes will be updated.
	 *
	 * By default, the DOM element of the current renderer will automatically be removed from its parent node and the DOM
	 * element of the new renderer will take its place.
	 *
	 * @deprecated Use setRenderer instead.
	 * @param {WebGLRenderer} renderer - The new renderer.
	 * @param {Boolean} updateDOM - Indicates whether the old canvas should be replaced by the new one in the DOM.
	 * @return {WebGLRenderer} The old renderer.
	 */

	replaceRenderer(renderer, updateDOM = true) {

		const oldRenderer = this.renderer;
		const parent = oldRenderer.domElement.parentNode;

		this.setRenderer(renderer);

		if(updateDOM && parent !== null) {

			parent.removeChild(oldRenderer.domElement);
			parent.appendChild(renderer.domElement);

		}

		return oldRenderer;

	}

	/**
	 * Creates a depth texture attachment that will be provided to all passes.
	 *
	 * Note: When a shader reads from a depth texture and writes to a render target that uses the same depth texture
	 * attachment, the depth information will be lost. This happens even if `depthWrite` is disabled.
	 *
	 * @private
	 * @return {DepthTexture} The depth texture.
	 */

	createDepthTexture() {

		const depthTexture = this.depthTexture = new DepthTexture();

		// Hack: Make sure the input buffer uses the depth texture.
		this.inputBuffer.depthTexture = depthTexture;
		this.inputBuffer.dispose();

		if(this.inputBuffer.stencilBuffer) {

			depthTexture.format = DepthStencilFormat;
			depthTexture.type = UnsignedInt248Type;

		} else {

			depthTexture.type = UnsignedIntType;

		}

		return depthTexture;

	}

	/**
	 * Deletes the current depth texture.
	 *
	 * @private
	 */

	deleteDepthTexture() {

		if(this.depthTexture !== null) {

			this.depthTexture.dispose();
			this.depthTexture = null;

			// Update the input buffer.
			this.inputBuffer.depthTexture = null;
			this.inputBuffer.dispose();

			for(const pass of this.passes) {

				pass.setDepthTexture(null);

			}

		}

	}

	/**
	 * Creates a new render target.
	 *
	 * @deprecated Create buffers manually via WebGLRenderTarget instead.
	 * @param {Boolean} depthBuffer - Whether the render target should have a depth buffer.
	 * @param {Boolean} stencilBuffer - Whether the render target should have a stencil buffer.
	 * @param {Number} type - The frame buffer type.
	 * @param {Number} multisampling - The number of samples to use for antialiasing.
	 * @return {WebGLRenderTarget} A new render target that equals the renderer's canvas.
	 */

	createBuffer(depthBuffer, stencilBuffer, type, multisampling) {

		const renderer = this.renderer;
		const size = (renderer === null) ? new Vector2() : renderer.getDrawingBufferSize(new Vector2());

		const options = {
			minFilter: LinearFilter,
			magFilter: LinearFilter,
			stencilBuffer,
			depthBuffer,
			type
		};

		const renderTarget = new WebGLRenderTarget(size.width, size.height, options);

		if(multisampling > 0) {

			renderTarget.ignoreDepthForMultisampleCopy = false;
			renderTarget.samples = multisampling;

		}

		if(type === UnsignedByteType && renderer !== null && renderer.outputColorSpace === SRGBColorSpace) {

			renderTarget.texture.colorSpace = SRGBColorSpace;

		}

		renderTarget.texture.name = "EffectComposer.Buffer";
		renderTarget.texture.generateMipmaps = false;

		return renderTarget;

	}

	/**
	 * Can be used to change the main scene for all registered passes and effects.
	 *
	 * @param {Scene} scene - The scene.
	 */

	setMainScene(scene) {

		for(const pass of this.passes) {

			pass.mainScene = scene;

		}

	}

	/**
	 * Can be used to change the main camera for all registered passes and effects.
	 *
	 * @param {Camera} camera - The camera.
	 */

	setMainCamera(camera) {

		for(const pass of this.passes) {

			pass.mainCamera = camera;

		}

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
		const alpha = renderer.getContext().getContextAttributes().alpha;
		const frameBufferType = this.inputBuffer.texture.type;

		pass.setRenderer(renderer);
		pass.setSize(drawingBufferSize.width, drawingBufferSize.height);
		pass.initialize(renderer, alpha, frameBufferType);

		if(this.autoRenderToScreen) {

			if(passes.length > 0) {

				passes[passes.length - 1].renderToScreen = false;

			}

			if(pass.renderToScreen) {

				this.autoRenderToScreen = false;

			}

		}

		if(index !== undefined) {

			passes.splice(index, 0, pass);

		} else {

			passes.push(pass);

		}

		if(this.autoRenderToScreen) {

			passes[passes.length - 1].renderToScreen = true;

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
		const index = passes.indexOf(pass);
		const exists = (index !== -1);
		const removed = exists && (passes.splice(index, 1).length > 0);

		if(removed) {

			if(this.depthTexture !== null) {

				// Check if the depth texture is still required.
				const reducer = (a, b) => (a || b.needsDepthTexture);
				const depthTextureRequired = passes.reduce(reducer, false);

				if(!depthTextureRequired) {

					if(pass.getDepthTexture() === this.depthTexture) {

						pass.setDepthTexture(null);

					}

					this.deleteDepthTexture();

				}

			}

			if(this.autoRenderToScreen) {

				// Check if the removed pass was the last one.
				if(index === passes.length) {

					pass.renderToScreen = false;

					if(passes.length > 0) {

						passes[passes.length - 1].renderToScreen = true;

					}

				}

			}

		}

	}

	/**
	 * Removes all passes.
	 */

	removeAllPasses() {

		const passes = this.passes;

		this.deleteDepthTexture();

		if(passes.length > 0) {

			if(this.autoRenderToScreen) {

				passes[passes.length - 1].renderToScreen = false;

			}

			this.passes = [];

		}

	}

	/**
	 * Renders all enabled passes in the order in which they were added.
	 *
	 * @param {Number} [deltaTime] - The time since the last frame in seconds.
	 */

	render(deltaTime) {

		const renderer = this.renderer;
		const copyPass = this.copyPass;

		let inputBuffer = this.inputBuffer;
		let outputBuffer = this.outputBuffer;

		let stencilTest = false;
		let context, stencil, buffer;

		if(deltaTime === undefined) {

			this.timer.update();
			deltaTime = this.timer.getDelta();

		}

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
	 * Sets the size of the buffers, passes and the renderer.
	 *
	 * @param {Number} width - The width.
	 * @param {Number} height - The height.
	 * @param {Boolean} [updateStyle] - Determines whether the style of the canvas should be updated.
	 */

	setSize(width, height, updateStyle) {

		const renderer = this.renderer;
		const currentSize = renderer.getSize(new Vector2());

		if(width === undefined || height === undefined) {

			width = currentSize.width;
			height = currentSize.height;

		}

		if(currentSize.width !== width || currentSize.height !== height) {

			// Update the logical render size.
			renderer.setSize(width, height, updateStyle);

		}

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

		this.dispose();
		this.autoRenderToScreen = true;

	}

	/**
	 * Disposes this composer and all passes.
	 */

	dispose() {

		for(const pass of this.passes) {

			pass.dispose();

		}

		this.passes = [];

		if(this.inputBuffer !== null) {

			this.inputBuffer.dispose();

		}

		if(this.outputBuffer !== null) {

			this.outputBuffer.dispose();

		}

		this.deleteDepthTexture();
		this.copyPass.dispose();
		this.timer.dispose();

		Pass.fullscreenGeometry.dispose();

	}

}
