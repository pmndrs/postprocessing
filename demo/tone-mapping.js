import {
	AmbientLight,
	BoxBufferGeometry,
	CubeTextureLoader,
	DirectionalLight,
	Mesh,
	MeshPhongMaterial,
	OrbitControls,
	RepeatWrapping,
	TextureLoader
} from "three";

import { RenderPass, ToneMappingPass } from "../src";
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
 * A tone-mapping demo setup.
 *
 * @class ToneMappingDemo
 * @constructor
 * @param {EffectComposer} composer - An effect composer.
 */

export class ToneMappingDemo extends Demo {

	constructor(composer) {

		super(composer);

		/**
		 * A dot screen pass.
		 *
		 * @property dotScreenPass
		 * @type DotScreenPass
		 * @private
		 */

		this.toneMappingPass = null;

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

		const path = "textures/skies/sunset/";
		const format = ".png";
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

		camera.position.set(-3, 0, -3);
		camera.lookAt(this.controls.target);
		scene.add(camera);

		// Sky.

		scene.background = assets.get("sky");

		// Lights.

		const ambientLight = new AmbientLight(0x666666);
		const directionalLight = new DirectionalLight(0xffbbaa);

		directionalLight.position.set(1440, 200, 2000);
		directionalLight.target.position.copy(scene.position);

		scene.add(directionalLight);
		scene.add(ambientLight);

		// Objects.

		const mesh = new Mesh(
			new BoxBufferGeometry(1, 1, 1),
			new MeshPhongMaterial({
				map: assets.get("crate-color")
			})
		);

		this.object = mesh;
		scene.add(mesh);

		// Passes.

		composer.addPass(new RenderPass(scene, camera));

		const pass = new ToneMappingPass({
			adaptive: true,
			resolution: 256,
			distinction: 1.0
		});

		pass.renderToScreen = true;
		this.toneMappingPass = pass;
		composer.addPass(pass);

	}

	/**
	 * Updates this demo.
	 *
	 * @method update
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
	 * @method configure
	 * @param {GUI} gui - A GUI.
	 */

	configure(gui) {

		const pass = this.toneMappingPass;

		const params = {
			"resolution": Math.round(Math.log(pass.resolution) / Math.log(2)),
			"adaptive": pass.adaptive,
			"distinction": pass.luminosityMaterial.uniforms.distinction.value,
			"adaption rate": pass.adaptiveLuminosityMaterial.uniforms.tau.value,
			"average lum": pass.toneMappingMaterial.uniforms.averageLuminance.value,
			"max lum": pass.toneMappingMaterial.uniforms.maxLuminance.value,
			"middle grey": pass.toneMappingMaterial.uniforms.middleGrey.value
		};

		gui.add(params, "resolution").min(6).max(11).step(1).onChange(function() { pass.resolution = Math.pow(2, params.resolution); });
		gui.add(params, "adaptive").onChange(function() { pass.adaptive = params.adaptive; });

		let f = gui.addFolder("Luminance");
		f.add(params, "distinction").min(1.0).max(10.0).step(0.1).onChange(function() { pass.luminosityMaterial.uniforms.distinction.value = params.distinction; });
		f.add(params, "adaption rate").min(0.0).max(2.0).step(0.01).onChange(function() { pass.adaptiveLuminosityMaterial.uniforms.tau.value = params["adaption rate"]; });
		f.add(params, "average lum").min(0.01).max(1.0).step(0.01).onChange(function() { pass.toneMappingMaterial.uniforms.averageLuminance.value = params["average lum"]; });
		f.add(params, "max lum").min(0.0).max(32.0).step(1).onChange(function() { pass.toneMappingMaterial.uniforms.maxLuminance.value = params["max lum"]; });
		f.add(params, "middle grey").min(0.0).max(1.0).step(0.01).onChange(function() { pass.toneMappingMaterial.uniforms.middleGrey.value = params["middle grey"]; });
		f.open();

	}

}
