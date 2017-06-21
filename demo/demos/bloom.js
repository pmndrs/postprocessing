import {
	AmbientLight,
	BoxBufferGeometry,
	CubeTextureLoader,
	DirectionalLight,
	FlatShading,
	Mesh,
	MeshPhongMaterial,
	MeshLambertMaterial,
	Object3D,
	OrbitControls,
	SphereBufferGeometry
} from "three";

import { BloomPass, KernelSize, RenderPass } from "../../src";
import { Demo } from "./demo.js";

/**
 * PI times two.
 *
 * @type {Number}
 * @private
 */

const TWO_PI = 2.0 * Math.PI;

/**
 * A bloom demo setup.
 */

export class BloomDemo extends Demo {

	/**
	 * Constructs a new bloom demo.
	 *
	 * @param {EffectComposer} composer - An effect composer.
	 */

	constructor(composer) {

		super(composer);

		/**
		 * A bloom pass.
		 *
		 * @type {BloomPass}
		 * @private
		 */

		this.bloomPass = null;

		/**
		 * An object.
		 *
		 * @type {Object3D}
		 * @private
		 */

		this.object = null;

	}

	/**
	 * Loads scene assets.
	 *
	 * @param {Function} callback - A callback function.
	 */

	load(callback) {

		const assets = new Map();
		const loadingManager = this.loadingManager;
		const cubeTextureLoader = new CubeTextureLoader(loadingManager);

		const path = "textures/skies/space2/";
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

					callback();

				}

			};

			cubeTextureLoader.load(urls, function(textureCube) {

				assets.set("sky", textureCube);

			});

		} else {

			callback();

		}

	}

	/**
	 * Creates the scene.
	 */

	initialise() {

		const scene = this.scene;
		const camera = this.camera;
		const assets = this.assets;
		const composer = this.composer;

		// Controls.

		this.controls = new OrbitControls(camera, composer.renderer.domElement);

		// Camera.

		camera.position.set(-10, 6, 15);
		camera.lookAt(this.controls.target);

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

		let object = new Object3D();

		let geometry = new SphereBufferGeometry(1, 4, 4);
		let material;
		let i, mesh;

		for(i = 0; i < 100; ++i) {

			material = new MeshPhongMaterial({
				color: 0xffffff * Math.random(),
				shading: FlatShading
			});

			mesh = new Mesh(geometry, material);
			mesh.position.set(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize();
			mesh.position.multiplyScalar(Math.random() * 4);
			mesh.rotation.set(Math.random() * 2, Math.random() * 2, Math.random() * 2);
			mesh.scale.multiplyScalar(Math.random() * 0.5);
			object.add(mesh);

		}

		this.object = object;

		scene.add(object);

		// Cage object.

		mesh = new Mesh(
			new BoxBufferGeometry(0.25, 8.25, 0.25),
			new MeshLambertMaterial({
				color: 0x0b0b0b
			})
		);

		object = new Object3D();
		let o0, o1, o2;

		o0 = object.clone();

		let clone = mesh.clone();
		clone.position.set(-4, 0, 4);
		o0.add(clone);
		clone = mesh.clone();
		clone.position.set(4, 0, 4);
		o0.add(clone);
		clone = mesh.clone();
		clone.position.set(-4, 0, -4);
		o0.add(clone);
		clone = mesh.clone();
		clone.position.set(4, 0, -4);
		o0.add(clone);

		o1 = o0.clone();
		o1.rotation.set(Math.PI / 2, 0, 0);
		o2 = o0.clone();
		o2.rotation.set(0, 0, Math.PI / 2);

		object.add(o0);
		object.add(o1);
		object.add(o2);

		scene.add(object);

		// Passes.

		composer.addPass(new RenderPass(scene, camera));

		const pass = new BloomPass({
			resolutionScale: 0.5,
			strength: 1.0,
			distinction: 4.0
		});

		pass.renderToScreen = true;
		this.bloomPass = pass;
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

		const composer = this.composer;
		const pass = this.bloomPass;

		const params = {
			"resolution": pass.resolutionScale,
			"kernel size": pass.kernelSize,
			"intensity": pass.intensity,
			"distinction": pass.distinction,
			"blend": true,
			"blend mode": "screen"
		};

		gui.add(params, "resolution").min(0.0).max(1.0).step(0.01).onChange(function() { pass.resolutionScale = params.resolution; composer.setSize(); });
		gui.add(params, "kernel size").min(KernelSize.VERY_SMALL).max(KernelSize.HUGE).step(1).onChange(function() { pass.kernelSize = params["kernel size"]; });
		gui.add(params, "intensity").min(0.0).max(3.0).step(0.01).onChange(function() { pass.intensity = params.intensity; });

		const folder = gui.addFolder("Luminance");
		folder.add(params, "distinction").min(1.0).max(10.0).step(0.1).onChange(function() { pass.distinction = params.distinction; });
		folder.open();

		gui.add(params, "blend").onChange(function() {

			pass.combineMaterial.uniforms.opacity1.value = params.blend ? 1.0 : 0.0;

		});

		gui.add(params, "blend mode", ["add", "screen"]).onChange(function() {

			if(params["blend mode"] === "add") {

				delete pass.combineMaterial.defines.SCREEN_MODE;

			} else {

				pass.combineMaterial.defines.SCREEN_MODE = "1";

			}

			pass.combineMaterial.needsUpdate = true;

		});

	}

}
