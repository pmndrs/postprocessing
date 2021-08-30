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
		 * Spatial controls.
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

	render(deltaTime, timestamp) {

		if(this.controls !== null) {

			this.controls.update(timestamp);

		}

		this.composer.render(deltaTime);

	}

	reset() {

		super.reset();

		const renderPass = new RenderPass(this.scene, null);
		renderPass.enabled = this.renderPass.enabled;
		this.renderPass = renderPass;

		return this;

	}

}
