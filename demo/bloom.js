import {
	AmbientLight,
	BoxBufferGeometry,
	CubeTextureLoader,
	DirectionalLight,
	FlatShading,
	Mesh,
	MeshBasicMaterial,
	MeshPhongMaterial,
	MeshLambertMaterial,
	Object3D,
	OrbitControls,
	SphereBufferGeometry
} from "three";

import { BloomPass, RenderPass } from "../src";
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
 * A bloom demo setup.
 *
 * @class BloomDemo
 * @constructor
 * @param {EffectComposer} composer - An effect composer.
 */

export class BloomDemo extends Demo {

	constructor(composer) {

		super(composer);

		/**
		 * A bloom pass.
		 *
		 * @property bloomPass
		 * @type BloomPass
		 * @private
		 */

		this.bloomPass = null;

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
					this.initialise();
					callback();

				}

			};

			cubeTextureLoader.load(urls, function(textureCube) {

				assets.set("sky", textureCube);

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

		camera.position.set(-10, 6, 15);
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

		let object = new Object3D();

		let geometry = new SphereBufferGeometry(1, 4, 4);
		let material = new MeshBasicMaterial({
			color: 0xffffff,
			shading: FlatShading
		});

		let i, mesh;

		for(i = 0; i < 100; ++i) {

			material = new MeshPhongMaterial({
				color: 0xffffff * Math.random(),
				shading: FlatShading
			});

			mesh = new Mesh(geometry, material);
			mesh.position.set(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize();
			mesh.position.multiplyScalar(Math.random() * 400);
			mesh.rotation.set(Math.random() * 2, Math.random() * 2, Math.random() * 2);
			mesh.scale.x = mesh.scale.y = mesh.scale.z = Math.random() * 50;
			object.add(mesh);

		}

		object.scale.multiplyScalar(0.01);

		this.object = object;

		scene.add(object);

		// Cage object.

		mesh = new Mesh(
			new BoxBufferGeometry(25, 825, 25),
			new MeshLambertMaterial({
				color: 0x0b0b0b
			})
		);

		object = new Object3D();
		let o0, o1, o2;

		o0 = object.clone();

		let clone = mesh.clone();
		clone.position.set(-400, 0, 400);
		o0.add(clone);
		clone = mesh.clone();
		clone.position.set(400, 0, 400);
		o0.add(clone);
		clone = mesh.clone();
		clone.position.set(-400, 0, -400);
		o0.add(clone);
		clone = mesh.clone();
		clone.position.set(400, 0, -400);
		o0.add(clone);

		o1 = o0.clone();
		o1.rotation.set(Math.PI / 2, 0, 0);
		o2 = o0.clone();
		o2.rotation.set(0, 0, Math.PI / 2);

		object.add(o0);
		object.add(o1);
		object.add(o2);

		object.scale.multiplyScalar(0.01);

		scene.add(object);

		// Passes.

		composer.addPass(new RenderPass(scene, camera));

		const pass = new BloomPass({
			resolutionScale: 0.5,
			blurriness: 1.0,
			strength: 1.0,
			distinction: 4.0
		});

		pass.renderToScreen = true;
		this.bloomPass = pass;
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

	/**
	 * Registers configuration options.
	 *
	 * @method configure
	 * @param {GUI} gui - A GUI.
	 */

	configure(gui) {

		const composer = this.composer;
		const bloomPass = this.bloomPass;

		const params = {
			"resolution": bloomPass.resolutionScale,
			"blurriness": bloomPass.blurriness,
			"strength": bloomPass.combineMaterial.uniforms.opacity2.value,
			"distinction": bloomPass.luminosityMaterial.uniforms.distinction.value,
			"blend": true
		};

		gui.add(params, "resolution").min(0.0).max(1.0).step(0.01).onChange(function() { bloomPass.resolutionScale = params.resolution; composer.setSize(); });
		gui.add(params, "blurriness").min(0.0).max(3.0).step(0.1).onChange(function() { bloomPass.blurriness = params.blurriness; });
		gui.add(params, "strength").min(0.0).max(3.0).step(0.01).onChange(function() { bloomPass.combineMaterial.uniforms.opacity2.value = params.strength; });

		const folder = gui.addFolder("Luminance");
		folder.add(params, "distinction").min(1.0).max(10.0).step(0.1).onChange(function() { bloomPass.luminosityMaterial.uniforms.distinction.value = params.distinction; });
		folder.open();

		gui.add(params, "blend").onChange(function() {

			bloomPass.combineMaterial.uniforms.opacity1.value = params.blend ? 1.0 : 0.0;

		});

	}

}
