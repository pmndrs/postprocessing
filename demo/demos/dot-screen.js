import {
	AmbientLight,
	CubeTextureLoader,
	DirectionalLight,
	FlatShading,
	Mesh,
	MeshPhongMaterial,
	Object3D,
	OrbitControls,
	SphereBufferGeometry
} from "three";

import { DotScreenPass, RenderPass } from "../../src";
import { Demo } from "./demo.js";

/**
 * PI times two.
 *
 * @type {Number}
 * @private
 */

const TWO_PI = 2.0 * Math.PI;

/**
 * A dot screen demo setup.
 */

export class DotScreenDemo extends Demo {

	/**
	 * Constructs a new dot screen demo.
	 *
	 * @param {EffectComposer} composer - An effect composer.
	 */

	constructor(composer) {

		super(composer);

		/**
		 * A dot screen pass.
		 *
		 * @type {DotScreenPass}
		 * @private
		 */

		this.dotScreenPass = null;

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

		const path = "textures/skies/space3/";
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
	 */

	initialise() {

		const scene = this.scene;
		const camera = this.camera;
		const assets = this.assets;
		const composer = this.composer;

		// Controls.

		this.controls = new OrbitControls(camera, composer.renderer.domElement);

		// Camera.

		camera.position.set(10, 1, 10);
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

		const pass = new DotScreenPass({
			scale: 0.8,
			angle: Math.PI * 0.5,
			intensity: 0.25
		});

		pass.renderToScreen = true;
		this.dotScreenPass = pass;
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

			object.rotation.x += 0.0005;
			object.rotation.y += 0.001;

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

		const pass = this.dotScreenPass;

		const params = {
			"average": pass.material.defines.AVERAGE !== undefined,
			"scale": pass.material.uniforms.scale.value,
			"angle": pass.material.uniforms.angle.value,
			"intensity": pass.material.uniforms.intensity.value,
			"center X": pass.material.uniforms.offsetRepeat.value.x,
			"center Y": pass.material.uniforms.offsetRepeat.value.y
		};

		gui.add(params, "average").onChange(function() {

			params.average ? pass.material.defines.AVERAGE = "1" : delete pass.material.defines.AVERAGE;
			pass.material.needsUpdate = true;

		});

		gui.add(params, "scale").min(0.0).max(1.0).step(0.01).onChange(function() { pass.material.uniforms.scale.value = params.scale; });
		gui.add(params, "angle").min(0.0).max(Math.PI).step(0.001).onChange(function() { pass.material.uniforms.angle.value = params.angle; });
		gui.add(params, "intensity").min(0.0).max(1.0).step(0.01).onChange(function() { pass.material.uniforms.intensity.value = params.intensity; });

		let f = gui.addFolder("Center");
		f.add(params, "center X").min(-1.0).max(1.0).step(0.01).onChange(function() { pass.material.uniforms.offsetRepeat.value.x = params["center X"]; });
		f.add(params, "center Y").min(-1.0).max(1.0).step(0.01).onChange(function() { pass.material.uniforms.offsetRepeat.value.y = params["center Y"]; });

	}

}
