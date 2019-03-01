import {
	Color,
	LinearFilter,
	RepeatWrapping,
	RGBFormat,
	Uniform,
	Vector2,
	WebGLRenderTarget
} from "three";

import {
	DepthComparisonMaterial,
	OutlineEdgesMaterial,
	KernelSize
} from "../materials";

import { BlurPass, ClearPass, DepthPass, RenderPass, ShaderPass } from "../passes";
import { BlendFunction } from "./blending/BlendFunction.js";
import { Effect } from "./Effect.js";

import fragment from "./glsl/outline/shader.frag";
import vertex from "./glsl/outline/shader.vert";

/**
 * An outline effect.
 */

export class OutlineEffect extends Effect {

	/**
	 * Constructs a new outline effect.
	 *
	 * If you want dark outlines, remember to adjust the blend function.
	 *
	 * @param {Scene} scene - The main scene.
	 * @param {Camera} camera - The main camera.
	 * @param {Object} [options] - The options. See {@link BlurPass} and {@link OutlineEdgesMaterial} for additional parameters.
	 * @param {BlendFunction} [options.blendFunction=BlendFunction.SCREEN] - The blend function.  Set this to `BlendFunction.ALPHA` for dark outlines.
	 * @param {Number} [options.patternTexture=null] - A pattern texture.
	 * @param {Number} [options.edgeStrength=1.0] - The edge strength.
	 * @param {Number} [options.pulseSpeed=0.0] - The pulse speed. A value of zero disables the pulse effect.
	 * @param {Number} [options.visibleEdgeColor=0xffffff] - The color of visible edges.
	 * @param {Number} [options.hiddenEdgeColor=0x22090a] - The color of hidden edges.
	 * @param {Boolean} [options.blur=false] - Whether the outline should be blurred.
	 * @param {Boolean} [options.xRay=true] - Whether hidden parts of selected objects should be visible.
	 */

	constructor(scene, camera, options = {}) {

		const settings = Object.assign({
			blendFunction: BlendFunction.SCREEN,
			patternTexture: null,
			edgeStrength: 1.0,
			pulseSpeed: 0.0,
			visibleEdgeColor: 0xffffff,
			hiddenEdgeColor: 0x22090a,
			blur: false,
			xRay: true
		}, options);

		super("OutlineEffect", fragment, {

			blendFunction: settings.blendFunction,

			uniforms: new Map([
				["maskTexture", new Uniform(null)],
				["edgeTexture", new Uniform(null)],
				["edgeStrength", new Uniform(settings.edgeStrength)],
				["visibleEdgeColor", new Uniform(new Color(settings.visibleEdgeColor))],
				["hiddenEdgeColor", new Uniform(new Color(settings.hiddenEdgeColor))],
				["pulse", new Uniform(1.0)]
			])

		});

		this.setPatternTexture(settings.patternTexture);
		this.xRay = settings.xRay;

		/**
		 * The main scene.
		 *
		 * @type {Scene}
		 * @private
		 */

		this.mainScene = scene;

		/**
		 * The main camera.
		 *
		 * @type {Camera}
		 * @private
		 */

		this.mainCamera = camera;

		/**
		 * A depth render target.
		 *
		 * @type {WebGLRenderTarget}
		 * @private
		 */

		this.renderTargetDepth = new WebGLRenderTarget(1, 1, {
			minFilter: LinearFilter,
			magFilter: LinearFilter
		});

		this.renderTargetDepth.texture.name = "Outline.Depth";
		this.renderTargetDepth.texture.generateMipmaps = false;

		/**
		 * A render target for the outline mask.
		 *
		 * @type {WebGLRenderTarget}
		 * @private
		 */

		this.renderTargetMask = this.renderTargetDepth.clone();

		this.renderTargetMask.texture.format = RGBFormat;
		this.renderTargetMask.texture.name = "Outline.Mask";

		this.uniforms.get("maskTexture").value = this.renderTargetMask.texture;

		/**
		 * A render target for the edge detection.
		 *
		 * @type {WebGLRenderTarget}
		 * @private
		 */

		this.renderTargetEdges = new WebGLRenderTarget(1, 1, {
			minFilter: LinearFilter,
			magFilter: LinearFilter,
			stencilBuffer: false,
			depthBuffer: false,
			format: RGBFormat
		});

		this.renderTargetEdges.texture.name = "Outline.Edges";
		this.renderTargetEdges.texture.generateMipmaps = false;

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

		this.clearPass = new ClearPass({
			clearColor: new Color(0x000000),
			clearAlpha: 1.0
		});

		/**
		 * A depth pass.
		 *
		 * @type {DepthPass}
		 * @private
		 */

		this.depthPass = new DepthPass(this.mainScene, this.mainCamera);

		/**
		 * A depth comparison mask pass.
		 *
		 * @type {RenderPass}
		 * @private
		 */

		this.maskPass = new RenderPass(this.mainScene, this.mainCamera, {
			overrideMaterial: new DepthComparisonMaterial(this.depthPass.renderTarget.texture, this.mainCamera),
			clearColor: new Color(0xffffff),
			clearAlpha: 1.0
		});

		/**
		 * A blur pass.
		 *
		 * @type {BlurPass}
		 * @private
		 */

		this.blurPass = new BlurPass(settings);

		this.kernelSize = settings.kernelSize;
		this.blur = settings.blur;

		/**
		 * The original resolution.
		 *
		 * @type {Vector2}
		 * @private
		 */

		this.resolution = new Vector2();

		/**
		 * An outline edge detection pass.
		 *
		 * @type {ShaderPass}
		 * @private
		 */

		this.outlineEdgesPass = new ShaderPass(new OutlineEdgesMaterial(settings));
		this.outlineEdgesPass.getFullscreenMaterial().uniforms.maskTexture.value = this.renderTargetMask.texture;

		/**
		 * A list of objects to outline.
		 *
		 * @type {Object3D[]}
		 * @private
		 */

		this.selection = [];

		/**
		 * The current animation time.
		 *
		 * @type {Number}
		 * @private
		 */

		this.time = 0.0;

		/**
		 * The pulse speed. A value of zero disables the pulse effect.
		 *
		 * @type {Number}
		 */

		this.pulseSpeed = settings.pulseSpeed;

		/**
		 * A dedicated render layer for selected objects.
		 *
		 * This layer is set to 10 by default. If this collides with your own custom
		 * layers, please change it to a free layer before rendering!
		 *
		 * @type {Number}
		 */

		this.selectionLayer = 10;

		/**
		 * A clear flag.
		 *
		 * @type {Boolean}
		 * @private
		 */

		this.clear = false;

	}

	/**
	 * Indicates whether dithering is enabled.
	 *
	 * @type {Boolean}
	 */

	get dithering() {

		return this.blurPass.dithering;

	}

	/**
	 * Enables or disables dithering.
	 *
	 * @type {Boolean}
	 */

	set dithering(value) {

		this.blurPass.dithering = value;

	}

	/**
	 * The blur kernel size.
	 *
	 * @type {KernelSize}
	 */

	get kernelSize() {

		return this.blurPass.kernelSize;

	}

	/**
	 * @type {KernelSize}
	 */

	set kernelSize(value = KernelSize.VERY_SMALL) {

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
			this.vertexShader = vertex;

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
	 */

	getResolutionScale() {

		return this.blurPass.getResolutionScale();

	}

	/**
	 * Sets the resolution scale.
	 *
	 * @param {Number} scale - The new resolution scale.
	 */

	setResolutionScale(scale) {

		this.blurPass.setResolutionScale(scale);
		this.setSize(this.resolution.x, this.resolution.y);

	}

	/**
	 * Clears the current selection and selects a list of objects.
	 *
	 * @param {Object3D[]} objects - The objects that should be outlined. This array will be copied.
	 * @return {OutlinePass} This pass.
	 */

	setSelection(objects) {

		const selection = objects.slice(0);
		const selectionLayer = this.selectionLayer;

		let i, l;

		this.clearSelection();

		for(i = 0, l = selection.length; i < l; ++i) {

			selection[i].layers.enable(selectionLayer);

		}

		this.selection = selection;

		return this;

	}

	/**
	 * Clears the list of selected objects.
	 *
	 * @return {OutlinePass} This pass.
	 */

	clearSelection() {

		const selection = this.selection;
		const selectionLayer = this.selectionLayer;

		let i, l;

		for(i = 0, l = selection.length; i < l; ++i) {

			selection[i].layers.disable(selectionLayer);

		}

		this.selection = [];
		this.time = 0.0;
		this.clear = true;

		return this;

	}

	/**
	 * Selects an object.
	 *
	 * @param {Object3D} object - The object that should be outlined.
	 * @return {OutlinePass} This pass.
	 */

	selectObject(object) {

		object.layers.enable(this.selectionLayer);
		this.selection.push(object);

		return this;

	}

	/**
	 * Deselects an object.
	 *
	 * @param {Object3D} object - The object that should no longer be outlined.
	 * @return {OutlinePass} This pass.
	 */

	deselectObject(object) {

		const selection = this.selection;
		const index = selection.indexOf(object);

		if(index >= 0) {

			selection[index].layers.disable(this.selectionLayer);
			selection.splice(index, 1);

			if(selection.length === 0) {

				this.time = 0.0;
				this.clear = true;

			}

		}

		return this;

	}

	/**
	 * Sets the visibility of all selected objects.
	 *
	 * @private
	 * @param {Boolean} visible - Whether the selected objects should be visible.
	 */

	setSelectionVisible(visible) {

		const selection = this.selection;

		let i, l;

		for(i = 0, l = selection.length; i < l; ++i) {

			if(visible) {

				selection[i].layers.enable(0);

			} else {

				selection[i].layers.disable(0);

			}

		}

	}

	/**
	 * Updates this effect.
	 *
	 * @param {WebGLRenderer} renderer - The renderer.
	 * @param {WebGLRenderTarget} inputBuffer - A frame buffer that contains the result of the previous pass.
	 * @param {Number} [deltaTime] - The time between the last frame and the current one in seconds.
	 */

	update(renderer, inputBuffer, deltaTime) {

		const mainScene = this.mainScene;
		const mainCamera = this.mainCamera;
		const pulse = this.uniforms.get("pulse");

		const background = mainScene.background;
		const mask = mainCamera.layers.mask;

		if(this.selection.length > 0) {

			mainScene.background = null;
			pulse.value = 1.0;

			if(this.pulseSpeed > 0.0) {

				pulse.value = 0.625 + Math.cos(this.time * this.pulseSpeed * 10.0) * 0.375;
				this.time += deltaTime;

			}

			// Render a custom depth texture and ignore selected objects.
			this.setSelectionVisible(false);
			this.depthPass.render(renderer);
			this.setSelectionVisible(true);

			// Compare the depth of the selected objects with the depth texture.
			mainCamera.layers.mask = 1 << this.selectionLayer;
			this.maskPass.render(renderer, this.renderTargetMask);

			// Restore the camera layer mask and the scene background.
			mainCamera.layers.mask = mask;
			mainScene.background = background;

			// Detect the outline.
			this.outlineEdgesPass.render(renderer, null, this.renderTargetEdges);

			if(this.blur) {

				this.blurPass.render(renderer, this.renderTargetEdges, this.renderTargetBlurredEdges);

			}

		} else if(this.clear) {

			this.clearPass.render(renderer, this.renderTargetMask);

			this.clear = false;

		}

	}

	/**
	 * Updates the size of internal render targets.
	 *
	 * @param {Number} width - The width.
	 * @param {Number} height - The height.
	 */

	setSize(width, height) {

		this.resolution.set(width, height);
		this.renderTargetMask.setSize(width, height);

		this.blurPass.setSize(width, height);
		this.maskPass.setSize(width, height);
		this.depthPass.setSize(width, height);

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

		this.depthPass.initialize(renderer, alpha);
		this.maskPass.initialize(renderer, alpha);
		this.blurPass.initialize(renderer, alpha);

	}

}
