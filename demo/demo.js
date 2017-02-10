import { FogExp2, LoadingManager, PerspectiveCamera, Scene } from "three";

/**
 * A demo base class.
 *
 * @class Demo
 * @constructor
 * @param {EffectComposer} composer - An effect composer.
 */

export class Demo {

	constructor(composer) {

		/**
		 * An effect composer.
		 *
		 * @property composer
		 * @type EffectComposer
		 */

		this.composer = composer;

		/**
		 * A loading manager.
		 *
		 * @property loadingManager
		 * @type LoadingManager
		 */

		this.loadingManager = new LoadingManager();

		/**
		 * An asset map.
		 *
		 * @property assets
		 * @type Map
		 */

		this.assets = null;

		/**
		 * A scene.
		 *
		 * @property scene
		 * @type Scene
		 */

		this.scene = new Scene();
		this.scene.fog = new FogExp2(0x0d0d0d, 0.0025);

		/**
		 * A camera.
		 *
		 * @property camera
		 * @type PerspectiveCamera
		 */

		this.camera = new PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 2000);

		/**
		 * Camera controls.
		 *
		 * @property controls
		 * @type OrbitControls
		 */

		this.controls = null;

	}

	/**
	 * Loads the demo.
	 *
	 * @method load
	 * @param {Function} callback - A callback function.
	 */

	load(callback) {

		callback();

	}

	/**
	 * Creates the scene.
	 *
	 * @method initialise
	 */

	initialise() {}

	/**
	 * Updates the demo.
	 *
	 * @method update
	 */

	update() {}

	/**
	 * Registers configuration options.
	 *
	 * @method configure
	 * @param {GUI} gui - A GUI.
	 * @return {GUI} A GUI folder.
	 */

	configure(gui) {}

	/**
	 * Resets this demo.
	 *
	 * @method reset
	 * @chainable
	 * @return {Demo} This demo.
	 */

	reset() {

		const fog = this.scene.fog;

		this.scene = new Scene();
		this.scene.fog = fog;

		if(this.controls !== null) {

			this.controls.dispose();
			this.controls = null;

		}

		return this;

	}

}
