import {
	Color,
	LinearFilter,
	RepeatWrapping,
	RGBFormat,
	Uniform,
	UnsignedByteType,
	WebGLRenderTarget
} from "three";

import { Resizer, Selection } from "../core";
import { DepthComparisonMaterial, OutlineMaterial, KernelSize } from "../materials";
import { BlurPass, ClearPass, DepthPass, RenderPass, ShaderPass } from "../passes";
import { BlendFunction } from "./blending/BlendFunction.js";
import { Effect } from "./Effect.js";

import fragmentShader from "./glsl/outline/shader.frag";
import vertexShader from "./glsl/outline/shader.vert";

/**
 * An outline effect.
 */

export class OutlineEffect extends Effect {

	/**
	 * Constructs a new outline effect.
	 *
	 * If you want dark outlines, remember to use an appropriate blend function.
	 *
	 * @param {Scene} scene - The main scene.
	 * @param {Camera} camera - The main camera.
	 * @param {Object} [options] - The options.
	 * @param {BlendFunction} [options.blendFunction=BlendFunction.SCREEN] - The blend function.  Set this to `BlendFunction.ALPHA` for dark outlines.
	 * @param {Number} [options.patternTexture=null] - A pattern texture.
	 * @param {Number} [options.edgeStrength=1.0] - The edge strength.
	 * @param {Number} [options.pulseSpeed=0.0] - The pulse speed. A value of zero disables the pulse effect.
	 * @param {Number} [options.visibleEdgeColor=0xffffff] - The color of visible edges.
	 * @param {Number} [options.hiddenEdgeColor=0x22090a] - The color of hidden edges.
	 * @param {Number} [options.resolutionScale=0.5] - Deprecated. Use height or width instead.
	 * @param {Number} [options.width=Resizer.AUTO_SIZE] - The render width.
	 * @param {Number} [options.height=Resizer.AUTO_SIZE] - The render height.
	 * @param {KernelSize} [options.kernelSize=KernelSize.VERY_SMALL] - The blur kernel size.
	 * @param {Boolean} [options.blur=false] - Whether the outline should be blurred.
	 * @param {Boolean} [options.xRay=true] - Whether occluded parts of selected objects should be visible.
	 */

	constructor(scene, camera, {
		blendFunction = BlendFunction.SCREEN,
		patternTexture = null,
		edgeStrength = 1.0,
		pulseSpeed = 0.0,
		visibleEdgeColor = 0xffffff,
		hiddenEdgeColor = 0x22090a,
		resolutionScale = 0.5,
		width = Resizer.AUTO_SIZE,
		height = Resizer.AUTO_SIZE,
		kernelSize = KernelSize.VERY_SMALL,
		blur = false,
		xRay = true
	} = {}) {

		super("OutlineEffect", fragmentShader, {

			uniforms: new Map([
				["maskTexture", new Uniform(null)],
				["edgeTexture", new Uniform(null)],
				["edgeStrength", new Uniform(edgeStrength)],
				["visibleEdgeColor", new Uniform(new Color(visibleEdgeColor))],
				["hiddenEdgeColor", new Uniform(new Color(hiddenEdgeColor))],
				["pulse", new Uniform(1.0)],
				["patternScale", new Uniform(1.0)],
				["patternTexture", new Uniform(null)]
			])

		});

		// Handle alpha blending.
		this.blendMode.addEventListener("change", (event) => {

			if(this.blendMode.getBlendFunction() === BlendFunction.ALPHA) {

				this.defines.set("ALPHA", "1");

			} else {

				this.defines.delete("ALPHA");

			}

			this.setChanged();

		});

		this.blendMode.setBlendFunction(blendFunction);
		this.setPatternTexture(patternTexture);
		this.xRay = xRay;

		/**
		 * The main scene.
		 *
		 * @type {Scene}
		 * @private
		 */

		this.scene = scene;

		/**
		 * The main camera.
		 *
		 * @type {Camera}
		 * @private
		 */

		this.camera = camera;

		/**
		 * A render target for the outline mask.
		 *
		 * @type {WebGLRenderTarget}
		 * @private
		 */

		this.renderTargetMask = new WebGLRenderTarget(1, 1, {
			minFilter: LinearFilter,
			magFilter: LinearFilter,
			stencilBuffer: false,
			format: RGBFormat
		});

		this.renderTargetMask.texture.name = "Outline.Mask";

		this.uniforms.get("maskTexture").value = this.renderTargetMask.texture;

		/**
		 * A render target for the edge detection.
		 *
		 * @type {WebGLRenderTarget}
		 * @private
		 */

		this.renderTargetOutline = this.renderTargetMask.clone();
		this.renderTargetOutline.texture.name = "Outline.Edges";
		this.renderTargetOutline.depthBuffer = false;

		/**
		 * A render target for the blurred outline overlay.
		 *
		 * @type {WebGLRenderTarget}
		 * @private
		 */

		this.renderTargetBlurredOutline = this.renderTargetOutline.clone();
		this.renderTargetBlurredOutline.texture.name = "Outline.BlurredEdges";

		/**
		 * A clear pass.
		 *
		 * @type {ClearPass}
		 * @private
		 */

		this.clearPass = new ClearPass();
		this.clearPass.overrideClearColor = new Color(0x000000);
		this.clearPass.overrideClearAlpha = 1.0;

		/**
		 * A depth pass.
		 *
		 * @type {DepthPass}
		 * @private
		 */

		this.depthPass = new DepthPass(scene, camera);

		/**
		 * A depth comparison mask pass.
		 *
		 * @type {RenderPass}
		 * @private
		 */

		this.maskPass = new RenderPass(scene, camera,
			new DepthComparisonMaterial(this.depthPass.texture, camera));

		const clearPass = this.maskPass.getClearPass();
		clearPass.overrideClearColor = new Color(0xffffff);
		clearPass.overrideClearAlpha = 1.0;

		/**
		 * A blur pass.
		 *
		 * @type {BlurPass}
		 */

		this.blurPass = new BlurPass({ resolutionScale, width, height, kernelSize });
		this.blurPass.resolution.resizable = this;
		this.blur = blur;

		/**
		 * An outline detection pass.
		 *
		 * @type {ShaderPass}
		 * @private
		 */

		this.outlinePass = new ShaderPass(new OutlineMaterial());
		this.outlinePass.getFullscreenMaterial().uniforms.inputBuffer.value = this.renderTargetMask.texture;

		/**
		 * The current animation time.
		 *
		 * @type {Number}
		 * @private
		 */

		this.time = 0.0;

		/**
		 * A selection of objects that will be outlined.
		 *
		 * @type {Selection}
		 */

		this.selection = new Selection();

		/**
		 * The pulse speed. A value of zero disables the pulse effect.
		 *
		 * @type {Number}
		 */

		this.pulseSpeed = pulseSpeed;

	}

	/**
	 * The resolution of this effect.
	 *
	 * @type {Resizer}
	 */

	get resolution() {

		return this.blurPass.resolution;

	}

	/**
	 * The current width of the internal render targets.
	 *
	 * @type {Number}
	 * @deprecated Use resolution.width instead.
	 */

	get width() {

		return this.resolution.width;

	}

	/**
	 * Sets the render width.
	 *
	 * @type {Number}
	 * @deprecated Use resolution.width instead.
	 */

	set width(value) {

		this.resolution.width = value;

	}

	/**
	 * The current height of the internal render targets.
	 *
	 * @type {Number}
	 * @deprecated Use resolution.height instead.
	 */

	get height() {

		return this.resolution.height;

	}

	/**
	 * Sets the render height.
	 *
	 * @type {Number}
	 * @deprecated Use resolution.height instead.
	 */

	set height(value) {

		this.resolution.height = value;

	}

	/**
	 * @type {Number}
	 * @deprecated Use selection.layer instead.
	 */

	get selectionLayer() {

		return this.selection.layer;

	}

	/**
	 * @type {Number}
	 * @deprecated Use selection.layer instead.
	 */

	set selectionLayer(value) {

		this.selection.layer = value;

	}

	/**
	 * Indicates whether dithering is enabled.
	 *
	 * @type {Boolean}
	 * @deprecated Set the frameBufferType of the EffectComposer to HalfFloatType instead.
	 */

	get dithering() {

		return this.blurPass.dithering;

	}

	/**
	 * Enables or disables dithering.
	 *
	 * @type {Boolean}
	 * @deprecated Set the frameBufferType of the EffectComposer to HalfFloatType instead.
	 */

	set dithering(value) {

		this.blurPass.dithering = value;

	}

	/**
	 * The blur kernel size.
	 *
	 * @type {KernelSize}
	 * @deprecated Use blurPass.kernelSize instead.
	 */

	get kernelSize() {

		return this.blurPass.kernelSize;

	}

	/**
	 * Sets the kernel size.
	 *
	 * @type {KernelSize}
	 * @deprecated Use blurPass.kernelSize instead.
	 */

	set kernelSize(value) {

		this.blurPass.kernelSize = value;

	}

	/**
	 * Indicates whether the outlines should be blurred.
	 *
	 * @type {Boolean}
	 */

	get blur() {

		return this.blurPass.enabled;

	}

	/**
	 * @type {Boolean}
	 */

	set blur(value) {

		this.blurPass.enabled = value;

		this.uniforms.get("edgeTexture").value = value ?
			this.renderTargetBlurredOutline.texture :
			this.renderTargetOutline.texture;

	}

	/**
	 * Indicates whether X-Ray outlines are enabled.
	 *
	 * @type {Boolean}
	 */

	get xRay() {

		return this.defines.has("X_RAY");

	}

	/**
	 * Enables or disables X-Ray outlines.
	 *
	 * @type {Boolean}
	 */

	set xRay(value) {

		if(this.xRay !== value) {

			if(value) {

				this.defines.set("X_RAY", "1");

			} else {

				this.defines.delete("X_RAY");

			}

			this.setChanged();

		}

	}

	/**
	 * Sets the pattern texture.
	 *
	 * @param {Texture} texture - The new texture.
	 */

	setPatternTexture(texture) {

		if(texture !== null) {

			texture.wrapS = texture.wrapT = RepeatWrapping;

			this.defines.set("USE_PATTERN", "1");
			this.uniforms.get("patternTexture").value = texture;
			this.setVertexShader(vertexShader);

		} else {

			this.defines.delete("USE_PATTERN");
			this.uniforms.get("patternTexture").value = null;
			this.setVertexShader(null);

		}

		this.setChanged();

	}

	/**
	 * Returns the current resolution scale.
	 *
	 * @return {Number} The resolution scale.
	 * @deprecated Adjust the fixed resolution width or height instead.
	 */

	getResolutionScale() {

		return this.resolution.scale;

	}

	/**
	 * Sets the resolution scale.
	 *
	 * @param {Number} scale - The new resolution scale.
	 * @deprecated Adjust the fixed resolution width or height instead.
	 */

	setResolutionScale(scale) {

		this.resolution.scale = scale;

	}

	/**
	 * Clears the current selection and selects a list of objects.
	 *
	 * @param {Object3D[]} objects - The objects that should be outlined. This array will be copied.
	 * @return {OutlinePass} This pass.
	 * @deprecated Use selection.set instead.
	 */

	setSelection(objects) {

		this.selection.set(objects);

		return this;

	}

	/**
	 * Clears the list of selected objects.
	 *
	 * @return {OutlinePass} This pass.
	 * @deprecated Use selection.clear instead.
	 */

	clearSelection() {

		this.selection.clear();

		return this;

	}

	/**
	 * Selects an object.
	 *
	 * @param {Object3D} object - The object that should be outlined.
	 * @return {OutlinePass} This pass.
	 * @deprecated Use selection.add instead.
	 */

	selectObject(object) {

		this.selection.add(object);

		return this;

	}

	/**
	 * Deselects an object.
	 *
	 * @param {Object3D} object - The object that should no longer be outlined.
	 * @return {OutlinePass} This pass.
	 * @deprecated Use selection.delete instead.
	 */

	deselectObject(object) {

		this.selection.delete(object);

		return this;

	}

	/**
	 * Updates this effect.
	 *
	 * @param {WebGLRenderer} renderer - The renderer.
	 * @param {WebGLRenderTarget} inputBuffer - A frame buffer that contains the result of the previous pass.
	 * @param {Number} [deltaTime] - The time between the last frame and the current one in seconds.
	 */

	update(renderer, inputBuffer, deltaTime) {

		const scene = this.scene;
		const camera = this.camera;
		const selection = this.selection;
		const pulse = this.uniforms.get("pulse");

		const background = scene.background;
		const mask = camera.layers.mask;

		if(selection.size > 0) {

			scene.background = null;
			pulse.value = 1.0;

			if(this.pulseSpeed > 0.0) {

				pulse.value = 0.625 + Math.cos(this.time * this.pulseSpeed * 10.0) * 0.375;

			}

			this.time += deltaTime;

			// Render a custom depth texture and ignore selected objects.
			selection.setVisible(false);
			this.depthPass.render(renderer);
			selection.setVisible(true);

			// Compare the depth of the selected objects with the depth texture.
			camera.layers.set(selection.layer);
			this.maskPass.render(renderer, this.renderTargetMask);

			// Restore the camera layer mask and the scene background.
			camera.layers.mask = mask;
			scene.background = background;

			// Detect the outline.
			this.outlinePass.render(renderer, null, this.renderTargetOutline);

			if(this.blur) {

				this.blurPass.render(renderer, this.renderTargetOutline, this.renderTargetBlurredOutline);

			}

		} else if(this.time > 0.0) {

			this.clearPass.render(renderer, this.renderTargetMask);
			this.time = 0.0;

		}

	}

	/**
	 * Updates the size of internal render targets.
	 *
	 * @param {Number} width - The width.
	 * @param {Number} height - The height.
	 */

	setSize(width, height) {

		this.blurPass.setSize(width, height);
		this.renderTargetMask.setSize(width, height);

		const w = this.resolution.width;
		const h = this.resolution.height;

		this.depthPass.setSize(w, h);
		this.renderTargetOutline.setSize(w, h);
		this.renderTargetBlurredOutline.setSize(w, h);
		this.outlinePass.getFullscreenMaterial().setTexelSize(1.0 / w, 1.0 / h);

	}

	/**
	 * Performs initialization tasks.
	 *
	 * @param {WebGLRenderer} renderer - The renderer.
	 * @param {Boolean} alpha - Whether the renderer uses the alpha channel or not.
	 * @param {Number} frameBufferType - The type of the main frame buffers.
	 */

	initialize(renderer, alpha, frameBufferType) {

		// No need for high precision: the blur pass operates on a mask texture.
		this.blurPass.initialize(renderer, alpha, UnsignedByteType);

		if(frameBufferType !== undefined) {

			// These passes ignore the buffer type.
			this.depthPass.initialize(renderer, alpha, frameBufferType);
			this.maskPass.initialize(renderer, alpha, frameBufferType);
			this.outlinePass.initialize(renderer, alpha, frameBufferType);

		}

	}

}
