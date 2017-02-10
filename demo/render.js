import {
	AmbientLight,
	BoxBufferGeometry,
	DirectionalLight,
	Mesh,
	MeshPhongMaterial,
	OrbitControls,
	RepeatWrapping,
	TextureLoader
} from "three";

import { RenderPass } from "../src";
import { Demo } from "./demo.js";

/**
 * PI times two.
 *
 * @property TWO_PI
 * @type Number
 * @private
 * @static
 * @final
 */

const TWO_PI = 2.0 * Math.PI;

/**
 * A render demo setup.
 *
 * @class RenderDemo
 * @constructor
 * @param {EffectComposer} composer - An effect composer.
 */

export class RenderDemo extends Demo {

	constructor(composer) {

		super(composer);

		/**
		 * An object.
		 *
		 * @property object
		 * @type Object3D
		 * @private
		 */

		this.object = null;

	}

	/**
	 * Loads scene assets.
	 *
	 * @method load
	 * @param {Function} callback - A callback function.
	 */

	load(callback) {

		const assets = new Map();
		const loadingManager = this.loadingManager;
		const textureLoader = new TextureLoader(loadingManager);

		if(this.assets === null) {

			loadingManager.onProgress = (item, loaded, total) => {

				if(loaded === total) {

					this.assets = assets;
					this.initialise();
					callback();

				}

			};

			textureLoader.load("textures/crate.jpg", function(texture) {

				texture.wrapS = texture.wrapT = RepeatWrapping;
				assets.set("crate-color", texture);

			});

		} else {

			this.initialise();
			callback();

		}

	}

	/**
	 * Creates the scene.
	 *
	 * @method initialise
	 */

	initialise() {

		const scene = this.scene;
		const camera = this.camera;
		const assets = this.assets;
		const composer = this.composer;

		// Controls.

		this.controls = new OrbitControls(camera, composer.renderer.domElement);

		// Camera.

		camera.position.set(2, 1, 2);
		camera.lookAt(this.controls.target);
		scene.add(camera);

		// Lights.

		const ambientLight = new AmbientLight(0x666666);
		const directionalLight = new DirectionalLight(0xffbbaa);

		directionalLight.position.set(-1, 1, 1);
		directionalLight.target.position.copy(scene.position);

		scene.add(directionalLight);
		scene.add(ambientLight);

		// Objects.

		const mesh = new Mesh(
			new BoxBufferGeometry(1, 1, 1),
			new MeshPhongMaterial({
				color: 0xffffff,
				map: assets.get("crate-color")
			})
		);

		this.object = mesh;
		scene.add(mesh);

		// Passes.

		const pass = new RenderPass(scene, camera);
		pass.renderToScreen = true;

		composer.addPass(pass);

	}

	/**
	 * Creates the scene.
	 *
	 * @method createScene
	 */

	update() {

		const object = this.object;

		if(object !== null) {

			object.rotation.x += 0.001;
			object.rotation.y += 0.005;

			// Prevent overflow.
			if(object.rotation.x >= TWO_PI) { object.rotation.x -= TWO_PI; }
			if(object.rotation.y >= TWO_PI) { object.rotation.y -= TWO_PI; }

		}

	}

}
