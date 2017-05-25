import {
	BoxBufferGeometry,
	Mesh,
	MeshBasicMaterial,
	OrbitControls
} from "three";

import { DepthPass, RenderPass, TexturePass } from "../../src";
import { Demo } from "./demo.js";

/**
 * PI times two.
 *
 * @type {Number}
 * @private
 */

const TWO_PI = 2.0 * Math.PI;

/**
 * A depth texture demo setup.
 */

export class DepthDemo extends Demo {

	/**
	 * Constructs a new depth demo.
	 *
	 * @param {EffectComposer} composer - An effect composer.
	 */

	constructor(composer) {

		super(composer);

		/**
		 * An object.
		 *
		 * @type {Object3D}
		 * @private
		 */

		this.object = null;

		/**
		 * A texture pass.
		 *
		 * @type {TexturePass}
		 * @private
		 */

		this.texturePass = null;

		/**
		 * A depth pass.
		 *
		 * @type {DepthPass}
		 * @private
		 */

		this.depthPass = null;

	}

	/**
	 * Loads scene assets.
	 *
	 * @param {Function} callback - A callback function.
	 */

	load(callback) {

		this.initialise();
		callback();

	}

	/**
	 * Creates the scene.
	 */

	initialise() {

		const scene = this.scene;
		const camera = this.camera;
		const composer = this.composer;

		// Controls.

		this.controls = new OrbitControls(camera, composer.renderer.domElement);
		this.controls.enablePan = false;
		this.controls.maxDistance = 40;

		// Camera.

		camera.near = 0.01;
		camera.far = 50;
		camera.position.set(2, 1, 2);
		camera.lookAt(this.controls.target);

		// Objects.

		const mesh = new Mesh(
			new BoxBufferGeometry(1, 1, 1),
			new MeshBasicMaterial()
		);

		this.object = mesh;
		scene.add(mesh);

		// Passes.

		composer.addPass(new RenderPass(scene, camera));

		let pass = new TexturePass(composer.depthTexture);
		pass.enabled = false;

		this.texturePass = pass;
		composer.addPass(pass);

		pass = new DepthPass(camera);
		pass.renderToScreen = true;

		this.depthPass = pass;
		composer.addPass(pass);

	}

	/**
	 * Updates this demo.
	 *
	 * @param {Number} delta - The time since the last frame in seconds.
	 */

	update(delta) {

		const object = this.object;

		if(object !== null) {

			object.rotation.x += 0.001;
			object.rotation.y += 0.005;

			// Prevent overflow.
			if(object.rotation.x >= TWO_PI) { object.rotation.x -= TWO_PI; }
			if(object.rotation.y >= TWO_PI) { object.rotation.y -= TWO_PI; }

		}

	}

	/**
	 * Registers configuration options.
	 *
	 * @param {GUI} gui - A GUI.
	 */

	configure(gui) {

		const texturePass = this.texturePass;
		const depthPass = this.depthPass;

		const params = {
			"raw": false
		};

		gui.add(params, "raw").onChange(function() {

			texturePass.enabled = params.raw;
			depthPass.enabled = !params.raw;
			texturePass.renderToScreen = params.raw;
			depthPass.renderToScreen = !params.raw;

		});

	}

}
