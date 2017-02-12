import {
	AmbientLight,
	CubeTextureLoader,
	DirectionalLight,
	FlatShading,
	Mesh,
	MeshPhongMaterial,
	NearestFilter,
	Object3D,
	OrbitControls,
	SphereBufferGeometry,
	TextureLoader
} from "three";

import { GlitchMode, GlitchPass, RenderPass } from "../src";
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
 * A glitch demo setup.
 *
 * @class GlitchDemo
 * @constructor
 * @param {EffectComposer} composer - An effect composer.
 */

export class GlitchDemo extends Demo {

	constructor(composer) {

		super(composer);

		/**
		 * A glitch pass.
		 *
		 * @property glitchPass
		 * @type GlitchPass
		 * @private
		 */

		this.glitchPass = null;

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
		const cubeTextureLoader = new CubeTextureLoader(loadingManager);

		const path = "textures/skies/space4/";
		const format = ".jpg";
		const urls = [
			path + "px" + format, path + "nx" + format,
			path + "py" + format, path + "ny" + format,
			path + "pz" + format, path + "nz" + format
		];

		if(this.assets === null) {

			loadingManager.onProgress = (item, loaded, total) => {

				if(loaded === total) {

					this.assets = assets;
					this.initialise();
					callback();

				}

			};

			cubeTextureLoader.load(urls, function(textureCube) {

				assets.set("sky", textureCube);

			});

			textureLoader.load("textures/perturb.jpg", function(texture) {

				texture.magFilter = texture.minFilter = NearestFilter;
				assets.set("perturb-map", texture);

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

		camera.position.set(6, 1, 6);
		camera.lookAt(this.controls.target);
		scene.add(camera);

		// Sky.

		scene.background = assets.get("sky");

		// Lights.

		const ambientLight = new AmbientLight(0x666666);
		const directionalLight = new DirectionalLight(0xffbbaa);

		directionalLight.position.set(-1, 1, 1);
		directionalLight.target.position.copy(scene.position);

		scene.add(directionalLight);
		scene.add(ambientLight);

		// Random objects.

		const object = new Object3D();
		const geometry = new SphereBufferGeometry(1, 4, 4);

		let material, mesh;
		let i;

		for(i = 0; i < 100; ++i) {

			material = new MeshPhongMaterial({
				color: 0xffffff * Math.random(),
				shading: FlatShading
			});

			mesh = new Mesh(geometry, material);
			mesh.position.set(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize();
			mesh.position.multiplyScalar(Math.random() * 10);
			mesh.rotation.set(Math.random() * 2, Math.random() * 2, Math.random() * 2);
			mesh.scale.multiplyScalar(Math.random());
			object.add(mesh);

		}

		this.object = object;
		scene.add(object);

		// Passes.

		composer.addPass(new RenderPass(scene, camera));

		const pass = new GlitchPass({
			perturbMap: assets.get("perturb-map")
		});

		pass.renderToScreen = true;
		this.glitchPass = pass;
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

			object.rotation.x += 0.005;
			object.rotation.y += 0.01;

			// Prevent overflow.
			if(object.rotation.x >= TWO_PI) { object.rotation.x -= TWO_PI; }
			if(object.rotation.y >= TWO_PI) { object.rotation.y -= TWO_PI; }

		}

	}

	/**
	 * Registers configuration options.
	 *
	 * @method configure
	 * @param {GUI} gui - A GUI.
	 */

	configure(gui) {

		const pass = this.glitchPass;
		const perturbMap = pass.perturbMap;

		const params = {
			"mode": pass.mode,
			"custom noise": true
		};

		gui.add(params, "mode").min(GlitchMode.SPORADIC).max(GlitchMode.CONSTANT_WILD).step(1).onChange(function() {
			pass.mode = params.mode;
		});

		gui.add(params, "custom noise").onChange(function() {

			if(params["custom noise"]) {

				pass.perturbMap = perturbMap;

			} else {

				// Prevent the custom perturbation map from getting deleted.
				pass.perturbMap = null;
				pass.generatePerturbMap(64);

			}

		});

	}

}
