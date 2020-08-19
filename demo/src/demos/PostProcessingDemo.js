import { Demo } from "three-demo";
import { RenderPass } from "../../../src";

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
		 * Spatial controls
		 *
		 * @type {SpatialControls}
		 * @protected
		 */

		this.controls = null;

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

	}

	/**
	 * Renders this demo.
	 *
	 * @param {Number} deltaTime - The time since the last frame in seconds.
	 */

	render(deltaTime) {

		if(this.controls !== null) {

			this.controls.update(deltaTime);

		}

		// Let the effect composer take care of rendering.
		this.composer.render(deltaTime);

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
		this.renderPass = renderPass;

		return this;

	}

}
