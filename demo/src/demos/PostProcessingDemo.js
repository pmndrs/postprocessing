import { Demo } from "three-demo";
import { RenderPass, SMAAEffect } from "../../../src";

/**
 * A post processing demo base class.
 */

export class PostProcessingDemo extends Demo {

	/**
	 * Constructs a new post processing demo.
	 *
	 * @param {String} id - A unique identifier.
	 * @param {EffectComposer} composer - An effect composer.
	 */

	constructor(id, composer) {

		super(id);

		/**
		 * An effect composer.
		 *
		 * @type {EffectComposer}
		 * @protected
		 */

		this.composer = composer;

		/**
		 * A render pass that renders to screen.
		 *
		 * @type {RenderPass}
		 */

		this.renderPass = new RenderPass(this.scene, null);
		this.renderPass.renderToScreen = true;

	}

	/**
	 * Loads the SMAA images.
	 *
	 * @protected
	 */

	loadSMAAImages() {

		const assets = this.assets;
		const loadingManager = this.loadingManager;

		const searchImage = new Image();
		const areaImage = new Image();

		searchImage.addEventListener("load", function() {

			assets.set("smaa-search", this);
			loadingManager.itemEnd("smaa-search");

		});

		areaImage.addEventListener("load", function() {

			assets.set("smaa-area", this);
			loadingManager.itemEnd("smaa-area");

		});

		// Register the new image assets.
		loadingManager.itemStart("smaa-search");
		loadingManager.itemStart("smaa-area");

		// Load the images asynchronously.
		searchImage.src = SMAAEffect.searchImageDataURL;
		areaImage.src = SMAAEffect.areaImageDataURL;

	}

	/**
	 * Renders this demo.
	 *
	 * @param {Number} delta - The time since the last frame in seconds.
	 */

	render(delta) {

		// Let the effect composer take care of rendering.
		this.composer.render(delta);

	}

	/**
	 * Resets this demo.
	 *
	 * @return {Demo} This demo.
	 */

	reset() {

		super.reset();

		const renderPass = new RenderPass(this.scene, null);
		renderPass.enabled = this.renderPass.enabled;
		renderPass.renderToScreen = true;
		this.renderPass = renderPass;

		return this;

	}

}
