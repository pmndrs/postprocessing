import {
	Color,
	LinearFilter,
	MeshDepthMaterial,
	RGBADepthPacking,
	RGBFormat,
	WebGLRenderTarget
} from "three";

import {
	CopyMaterial,
	DepthComparisonMaterial,
	OutlineBlendMaterial,
	OutlineEdgesMaterial,
	KernelSize
} from "../materials";

import { BlurPass } from "./BlurPass.js";
import { Pass } from "./Pass.js";
import { RenderPass } from "./RenderPass.js";
import { ShaderPass } from "./ShaderPass.js";

/**
 * An outline pass.
 */

export class OutlinePass extends Pass {

	/**
	 * Constructs a new outline pass.
	 *
	 * @param {Scene} scene - The main scene.
	 * @param {Camera} camera - The main camera.
	 * @param {Object} [options] - Additional parameters. See {@link BlurPass}, {@link OutlineBlendMaterial} and {@link OutlineEdgesMaterial} for details.
	 * @param {Number} [options.pulseSpeed=0.0] - The pulse speed. A value of zero disables the pulse effect.
	 * @param {Boolean} [options.blur=true] - Whether the outline should be blurred.
	 */

	constructor(scene, camera, options = {}) {

		super("OutlinePass");

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
		 * A render target for depth information.
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
		 * A depth pass.
		 *
		 * @type {RenderPass}
		 * @private
		 */

		this.renderPassDepth = new RenderPass(this.mainScene, this.mainCamera, {
			overrideMaterial: new MeshDepthMaterial({
				depthPacking: RGBADepthPacking,
				morphTargets: true,
				skinning: true
			}),
			clearColor: new Color(0xffffff),
			clearAlpha: 1.0
		});

		/**
		 * A depth comparison mask pass.
		 *
		 * @type {RenderPass}
		 * @private
		 */

		this.renderPassMask = new RenderPass(this.mainScene, this.mainCamera, {
			overrideMaterial: new DepthComparisonMaterial(this.renderTargetDepth.texture, this.mainCamera),
			clearColor: new Color(0xffffff),
			clearAlpha: 1.0
		});

		/**
		 * A blur pass.
		 *
		 * @type {BlurPass}
		 * @private
		 */

		this.blurPass = new BlurPass(options);

		this.kernelSize = options.kernelSize;

		/**
		 * A copy pass that renders the read buffer to screen if needed.
		 *
		 * @type {ShaderPass}
		 * @private
		 */

		this.copyPass = new ShaderPass(new CopyMaterial());
		this.copyPass.renderToScreen = true;

		/**
		 * An outline edge detection material.
		 *
		 * @type {OutlineEdgesMaterial}
		 * @private
		 */

		this.outlineEdgesMaterial = new OutlineEdgesMaterial(options);
		this.outlineEdgesMaterial.uniforms.tMask.value = this.renderTargetMask.texture;

		/**
		 * An outline blend material.
		 *
		 * @type {OutlineBlendMaterial}
		 * @private
		 */

		this.outlineBlendMaterial = new OutlineBlendMaterial(options);
		this.outlineBlendMaterial.uniforms.tMask.value = this.renderTargetMask.texture;

		this.blur = (options.blur !== undefined) ? options.blur : true;

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

		this.pulseSpeed = (options.pulseSpeed !== undefined) ? options.pulseSpeed : 0.0;

		/**
		 * A dedicated render layer for selected objects.
		 *
		 * This layer is set to 10 by default. If this collides with your own custom
		 * layers, please change it to a free layer before rendering!
		 *
		 * @type {Number}
		 */

		this.selectionLayer = 10;

	}

	/**
	 * The resolution scale.
	 *
	 * @type {Number}
	 */

	get resolutionScale() {

		return this.blurPass.resolutionScale;

	}

	/**
	 * You need to call {@link EffectComposer#setSize} after changing this value.
	 *
	 * @type {Number}
	 */

	set resolutionScale(value = 0.5) {

		this.blurPass.resolutionScale = value;

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
	 * Indicates whether the outline overlay should be blurred.
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

		this.outlineBlendMaterial.uniforms.tEdges.value = value ?
			this.renderTargetBlurredEdges.texture :
			this.renderTargetEdges.texture;

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
	 * If enabled, the result will be dithered to remove banding artifacts.
	 *
	 * @type {Boolean}
	 */

	set dithering(value) {

		this.blurPass.dithering = value;

	}

	/**
	 * Indicates whether the effect should be applied to the input buffer.
	 *
	 * @type {Boolean}
	 */

	get blend() {

		return this.needsSwap;

	}

	/**
	 * If disabled, the input buffer will remain unaffected.
	 *
	 * You may use the {@link BloomPass#overlay} texture to apply the effect to
	 * your scene.
	 *
	 * @type {Boolean}
	 */

	set blend(value) {

		this.needsSwap = value;

	}

	/**
	 * The effect overlay texture.
	 *
	 * @type {Texture}
	 */

	get overlay() {

		return this.outlineBlendMaterial.uniforms.tEdges.value;

	}

	/**
	 * Sets a pattern texture to use as an overlay for selected objects.
	 *
	 * @param {Texture} [texture=null] - A pattern texture. Set to null to disable the pattern.
	 */

	setPatternTexture(texture = null) {

		this.outlineBlendMaterial.setPatternTexture(texture);

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
	 * Renders the effect.
	 *
	 * @param {WebGLRenderer} renderer - The renderer.
	 * @param {WebGLRenderTarget} inputBuffer - A frame buffer that contains the result of the previous pass.
	 * @param {WebGLRenderTarget} outputBuffer - A frame buffer that serves as the output render target unless this pass renders to screen.
	 * @param {Number} [delta] - The time between the last frame and the current one in seconds.
	 * @param {Boolean} [stencilTest] - Indicates whether a stencil mask is active.
	 */

	render(renderer, inputBuffer, outputBuffer, delta, stencilTest) {

		const mainScene = this.mainScene;
		const mainCamera = this.mainCamera;
		const pulse = this.outlineBlendMaterial.uniforms.pulse;

		let background, mask;

		if(this.selection.length > 0) {

			background = mainScene.background;
			mask = mainCamera.layers.mask;
			mainScene.background = null;

			pulse.value = 1.0;

			if(this.pulseSpeed > 0.0) {

				pulse.value = 0.625 + Math.cos(this.time * this.pulseSpeed * 10.0) * 0.375;
				this.time += delta;

			}

			// Render a custom depth texture and ignore selected objects.
			this.setSelectionVisible(false);
			this.renderPassDepth.render(renderer, null, this.renderTargetDepth);
			this.setSelectionVisible(true);

			// Create a mask for the selected objects using the depth information.
			mainCamera.layers.mask = 1 << this.selectionLayer;
			this.renderPassMask.render(renderer, null, this.renderTargetMask);

			// Restore the camera layer mask and the scene background.
			mainCamera.layers.mask = mask;
			mainScene.background = background;

			// Detect the outline.
			this.material = this.outlineEdgesMaterial;
			renderer.render(this.scene, this.camera, this.renderTargetEdges);

			if(this.blurPass.enabled) {

				// Blur the edges.
				this.blurPass.render(renderer, this.renderTargetEdges, this.renderTargetBlurredEdges);

			}

			if(this.blend) {

				// Draw the final overlay onto the scene colours.
				this.material = this.outlineBlendMaterial;
				this.outlineBlendMaterial.uniforms.tDiffuse.value = inputBuffer.texture;
				renderer.render(this.scene, this.camera, this.renderToScreen ? null : this.outputBuffer);

			}

		} else if(this.renderToScreen) {

			// Draw the read buffer to screen.
			this.copyPass.render(renderer, inputBuffer);

		}

	}

	/**
	 * Updates the size of this pass.
	 *
	 * @param {Number} width - The width.
	 * @param {Number} height - The height.
	 */

	setSize(width, height) {

		this.renderTargetDepth.setSize(width, height);
		this.renderTargetMask.setSize(width, height);

		this.renderPassDepth.setSize(width, height);
		this.renderPassMask.setSize(width, height);
		this.blurPass.setSize(width, height);

		width = this.blurPass.width;
		height = this.blurPass.height;

		this.renderTargetEdges.setSize(width, height);
		this.renderTargetBlurredEdges.setSize(width, height);

		this.outlineBlendMaterial.uniforms.aspect.value = width / height;
		this.outlineEdgesMaterial.setTexelSize(1.0 / width, 1.0 / height);

	}

	/**
	 * Performs initialization tasks.
	 *
	 * @param {WebGLRenderer} renderer - The renderer.
	 * @param {Boolean} alpha - Whether the renderer uses the alpha channel or not.
	 */

	initialize(renderer, alpha) {

		this.renderPassDepth.initialize(renderer, alpha);
		this.renderPassMask.initialize(renderer, alpha);
		this.blurPass.initialize(renderer, alpha);

	}

}
