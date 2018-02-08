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
	 * @param {PerspectiveCamera} camera - The main camera.
	 * @param {Object} [options] - Additional parameters. See {@link BlurPass}, {@link OutlineBlendMaterial} and {@link OutlineEdgesMaterial} for details.
	 * @param {Object} [options.pulseSpeed=0.0] - The pulse speed. A value of zero disables the pulse effect.
	 */

	constructor(scene, camera, options = {}) {

		super();

		/**
		 * The name of this pass.
		 */

		this.name = "OutlinePass";

		/**
		 * This pass renders to the write buffer when there are objects to outline.
		 */

		this.needsSwap = true;

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
		 * @type {PerspectiveCamera}
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

		this.renderTargetDepth.texture.name = "GodRays.Depth";
		this.renderTargetDepth.texture.generateMipmaps = false;

		/**
		 * A render target for the outline mask.
		 *
		 * @type {WebGLRenderTarget}
		 * @private
		 */

		this.renderTargetMask = this.renderTargetDepth.clone();

		this.renderTargetMask.texture.name = "GodRays.Mask";

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
			depthBuffer: false
		});

		this.renderTargetEdges.texture.name = "GodRays.Edges";
		this.renderTargetEdges.texture.generateMipmaps = false;

		/**
		 * A render target for the blurred outline overlay.
		 *
		 * @type {WebGLRenderTarget}
		 * @private
		 */

		this.renderTargetOutline = this.renderTargetEdges.clone();

		this.renderTargetOutline.texture.name = "GodRays.Outline";

		/**
		 * A depth pass.
		 *
		 * @type {RenderPass}
		 * @private
		 */

		this.renderPassDepth = new RenderPass(this.mainScene, this.mainCamera, {
			overrideMaterial: new MeshDepthMaterial({ depthPacking: RGBADepthPacking }),
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

		if(options.kernelSize === undefined) {

			this.blurPass.kernelSize = KernelSize.VERY_SMALL;

		}

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
		this.outlineBlendMaterial.uniforms.tEdges.value = this.renderTargetOutline.texture;

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

		/**
		 * The color of visible edges.
		 *
		 * @type {Color}
		 */

		this.visibleEdgeColor = new Color(1.0, 1.0, 1.0);

		/**
		 * The color of hidden edges.
		 *
		 * @type {Color}
		 */

		this.hiddenEdgeColor = new Color(0.1, 0.04, 0.02);

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

		for(i = 0, l = selection.length; i < l; ++i) {

			selection[i].layers.enable(selectionLayer);

		}

		this.clearSelection();
		this.selection = selection;
		this.needsSwap = selection.length > 0;

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
		this.needsSwap = false;
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
		this.needsSwap = true;

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

				// Nothing is being rendered to the buffers for now.
				this.needsSwap = false;
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

			selection[i].visible = visible;

		}

	}

	/**
	 * Renders the effect.
	 *
	 * @param {WebGLRenderer} renderer - The renderer.
	 * @param {WebGLRenderTarget} readBuffer - The read buffer.
	 * @param {WebGLRenderTarget} writeBuffer - The write buffer.
	 * @param {Number} delta - The time between the last frame and the current one in seconds.
	 */

	render(renderer, readBuffer, writeBuffer, delta) {

		const mainScene = this.mainScene;
		const mainCamera = this.mainCamera;

		const uniforms = this.outlineEdgesMaterial.uniforms;
		const visibleEdgeColor = uniforms.visibleEdgeColor.value;
		const hiddenEdgeColor = uniforms.hiddenEdgeColor.value;

		let background, mask, scalar;

		if(this.selection.length > 0) {

			background = mainScene.background;
			mask = mainCamera.layers.mask;
			mainScene.background = null;

			visibleEdgeColor.copy(this.visibleEdgeColor);
			hiddenEdgeColor.copy(this.hiddenEdgeColor);

			if(this.pulseSpeed > 0.0) {

				scalar = 0.625 + Math.cos(this.time * this.pulseSpeed * 10.0) * 0.375;
				this.time += delta;

				visibleEdgeColor.multiplyScalar(scalar);
				hiddenEdgeColor.multiplyScalar(scalar);

			}

			// Render a custom depth texture and ignore selected objects.
			this.setSelectionVisible(false);
			this.renderPassDepth.render(renderer, this.renderTargetDepth);
			this.setSelectionVisible(true);

			// Create a mask for the selected objects using the depth information.
			mainCamera.layers.mask = 1 << this.selectionLayer;
			this.renderPassMask.render(renderer, this.renderTargetMask);

			// Restore the camera layer mask and the scene background.
			mainCamera.layers.mask = mask;
			mainScene.background = background;

			// Detect the outline.
			this.quad.material = this.outlineEdgesMaterial;
			renderer.render(this.scene, this.camera, this.renderTargetEdges);

			// Blur the outline.
			this.blurPass.render(renderer, this.renderTargetEdges, this.renderTargetOutline);

			// Draw the blurred outline onto the scene colours.
			this.quad.material = this.outlineBlendMaterial;
			this.outlineBlendMaterial.uniforms.tDiffuse.value = readBuffer.texture;
			renderer.render(this.scene, this.camera, this.renderToScreen ? null : writeBuffer);

		} else if(this.renderToScreen) {

			// Draw the read buffer to screen.
			this.copyPass.render(renderer, readBuffer);

		}

	}

	/**
	 * Adjusts the format of the render targets and initialises internal passes.
	 *
	 * @param {WebGLRenderer} renderer - The renderer.
	 * @param {Boolean} alpha - Whether the renderer uses the alpha channel or not.
	 */

	initialize(renderer, alpha) {

		this.renderPassDepth.initialize(renderer, alpha);
		this.renderPassMask.initialize(renderer, alpha);
		this.blurPass.initialize(renderer, alpha);

		if(!alpha) {

			this.renderTargetMask.texture.format = RGBFormat;
			this.renderTargetEdges.texture.format = RGBFormat;
			this.renderTargetOutline.texture.format = RGBFormat;

		}

	}

	/**
	 * Updates this pass with the renderer's size.
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
		this.renderTargetOutline.setSize(width, height);

		this.outlineBlendMaterial.uniforms.aspect.value = width / height;
		this.outlineEdgesMaterial.setTexelSize(1.0 / width, 1.0 / height);

	}

}
