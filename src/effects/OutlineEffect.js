import {
	Color,
	LinearFilter,
	RepeatWrapping,
	RGBFormat,
	Uniform,
	WebGLRenderTarget
} from "three";

import { Selection } from "../core";
import { DepthComparisonMaterial, OutlineEdgesMaterial, KernelSize } from "../materials";
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
	 * @param {Number} [options.width=BlurPass.AUTO_SIZE] - The render width. Has no effect if blurring is disabled.
	 * @param {Number} [options.height=BlurPass.AUTO_SIZE] - The render height. Has no effect if blurring is disabled.
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
		width = BlurPass.AUTO_SIZE,
		height = BlurPass.AUTO_SIZE,
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
				["pulse", new Uniform(1.0)]
			])

		});

		// Intercept blend function changes.
		this.blendMode = ((defines) => (new Proxy(this.blendMode, {

			set(target, name, value) {

				if(value === BlendFunction.ALPHA) {

					defines.set("ALPHA", "1");

				} else {

					defines.delete("ALPHA");

				}

				target[name] = value;

				return true;

			}

		})))(this.defines);

		this.blendMode.blendFunction = blendFunction;
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

		this.renderTargetEdges = this.renderTargetMask.clone();
		this.renderTargetEdges.texture.name = "Outline.Edges";
		this.renderTargetEdges.depthBuffer = false;

		/**
		 * A render target for the blurred outline overlay.
		 *
		 * @type {WebGLRenderTarget}
		 * @private
		 */

		this.renderTargetBlurredEdges = this.renderTargetEdges.clone();
		this.renderTargetBlurredEdges.texture.name = "Outline.BlurredEdges";

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

		this.maskPass = new RenderPass(scene, camera, new DepthComparisonMaterial(this.depthPass.renderTarget.texture, camera));

		const clearPass = this.maskPass.getClearPass();
		clearPass.overrideClearColor = new Color(0xffffff);
		clearPass.overrideClearAlpha = 1.0;

		/**
		 * A blur pass.
		 *
		 * @type {BlurPass}
		 */

		this.blurPass = new BlurPass({ resolutionScale, width, height, kernelSize });
		this.blur = blur;

		/**
		 * An outline edge detection pass.
		 *
		 * @type {ShaderPass}
		 * @private
		 */

		this.outlineEdgesPass = new ShaderPass(new OutlineEdgesMaterial());
		this.outlineEdgesPass.getFullscreenMaterial().uniforms.maskTexture.value = this.renderTargetMask.texture;

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
	 * The current width of the internal render targets.
	 *
	 * @type {Number}
	 */

	get width() {

		return this.blurPass.width;

	}

	/**
	 * Sets the render width.
	 *
	 * Use {@link BlurPass.AUTO_SIZE} to activate automatic sizing based on the
	 * render height and aspect ratio.
	 *
	 * @type {Number}
	 */

	set width(value) {

		const blurPass = this.blurPass;
		blurPass.width = value;

		this.renderTargetEdges.setSize(blurPass.width, blurPass.height);
		this.renderTargetBlurredEdges.setSize(blurPass.width, blurPass.height);
		this.outlineEdgesPass.getFullscreenMaterial().setTexelSize(1.0 / blurPass.width, 1.0 / blurPass.height);

	}

	/**
	 * The current height of the internal render targets.
	 *
	 * @type {Number}
	 */

	get height() {

		return this.blurPass.height;

	}

	/**
	 * Sets the render height.
	 *
	 * Use {@link BlurPass.AUTO_SIZE} to activate automatic sizing based on the
	 * render width and aspect ratio.
	 *
	 * @type {Number}
	 */

	set height(value) {

		const blurPass = this.blurPass;
		blurPass.height = value;

		this.renderTargetEdges.setSize(blurPass.width, blurPass.height);
		this.renderTargetBlurredEdges.setSize(blurPass.width, blurPass.height);
		this.outlineEdgesPass.getFullscreenMaterial().setTexelSize(1.0 / blurPass.width, 1.0 / blurPass.height);

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
	 * @deprecated Use blurPass.dithering instead.
	 */

	get dithering() {

		return this.blurPass.dithering;

	}

	/**
	 * Enables or disables dithering.
	 *
	 * @type {Boolean}
	 * @deprecated Use blurPass.dithering instead.
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
			this.renderTargetBlurredEdges.texture :
			this.renderTargetEdges.texture;

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
	 * You'll need to call {@link EffectPass#recompile} after changing this value.
	 *
	 * @type {Boolean}
	 */

	set xRay(value) {

		value ? this.defines.set("X_RAY", "1") : this.defines.delete("X_RAY");

	}

	/**
	 * Sets the pattern texture.
	 *
	 * You'll need to call {@link EffectPass#recompile} after changing the
	 * texture.
	 *
	 * @param {Texture} texture - The new texture.
	 */

	setPatternTexture(texture) {

		if(texture !== null) {

			texture.wrapS = texture.wrapT = RepeatWrapping;

			this.defines.set("USE_PATTERN", "1");
			this.uniforms.set("patternScale", new Uniform(1.0));
			this.uniforms.set("patternTexture", new Uniform(texture));
			this.vertexShader = vertexShader;

		} else {

			this.defines.delete("USE_PATTERN");
			this.uniforms.delete("patternScale");
			this.uniforms.delete("patternTexture");
			this.vertexShader = null;

		}

	}

	/**
	 * Returns the current resolution scale.
	 *
	 * @return {Number} The resolution scale.
	 * @deprecated Adjust the width or height instead.
	 */

	getResolutionScale() {

		return this.blurPass.getResolutionScale();

	}

	/**
	 * Sets the resolution scale.
	 *
	 * @param {Number} scale - The new resolution scale.
	 * @deprecated Adjust the width or height instead.
	 */

	setResolutionScale(scale) {

		const originalSize = this.blurPass.getOriginalSize();
		this.blurPass.setResolutionScale(scale);
		this.depthPass.setResolutionScale(scale);
		this.setSize(originalSize.x, originalSize.y);

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
			this.outlineEdgesPass.render(renderer, null, this.renderTargetEdges);

			if(this.blur) {

				this.blurPass.render(renderer, this.renderTargetEdges, this.renderTargetBlurredEdges);

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

		this.renderTargetMask.setSize(width, height);
		this.depthPass.setSize(width, height);
		this.blurPass.setSize(width, height);

		width = this.blurPass.width;
		height = this.blurPass.height;

		this.renderTargetEdges.setSize(width, height);
		this.renderTargetBlurredEdges.setSize(width, height);
		this.outlineEdgesPass.getFullscreenMaterial().setTexelSize(1.0 / width, 1.0 / height);

	}

	/**
	 * Performs initialization tasks.
	 *
	 * @param {WebGLRenderer} renderer - The renderer.
	 * @param {Boolean} alpha - Whether the renderer uses the alpha channel or not.
	 */

	initialize(renderer, alpha) {

		this.blurPass.initialize(renderer, alpha);
		this.depthPass.initialize(renderer, alpha);
		this.maskPass.initialize(renderer, alpha);

	}

}
