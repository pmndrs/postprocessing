import {
	AmbientLight,
	BufferAttribute,
	BufferGeometry,
	CubeTextureLoader,
	DirectionalLight,
	MeshPhongMaterial,
	ObjectLoader,
	OrbitControls,
	Points,
	PointsMaterial,
	RepeatWrapping,
	TextureLoader
} from "three";

import { GodRaysPass, KernelSize, RenderPass } from "../src";
import { Demo } from "./demo.js";

/**
 * A god rays demo setup.
 *
 * @class BloomDemo
 * @constructor
 * @param {EffectComposer} composer - An effect composer.
 */

export class GodRaysDemo extends Demo {

	constructor(composer) {

		super(composer);

		/**
		 * A god rays pass.
		 *
		 * @property godRaysPass
		 * @type GodRaysPass
		 * @private
		 */

		this.godRaysPass = null;

		/**
		 * A sun.
		 *
		 * @property sun
		 * @type Points
		 * @private
		 */

		this.sun = null;

		/**
		 * A directional light.
		 *
		 * @property directionalLight
		 * @type DirectionalLight
		 * @private
		 */

		this.directionalLight = null;

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
		const textureLoader = new TextureLoader(loadingManager);
		const modelLoader = new ObjectLoader(loadingManager);

		const path = "textures/skies/starry/";
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

			modelLoader.load("models/waggon.json", function(object) {

				object.rotation.x = Math.PI * 0.25;
				object.rotation.y = Math.PI * 0.75;

				assets.set("waggon", object);

			});

			textureLoader.load("textures/wood.jpg", function(texture) {

				texture.wrapS = texture.wrapT = RepeatWrapping;
				assets.set("wood-diffuse", texture);

			});

			textureLoader.load("textures/woodnormals.jpg", function(texture) {

				texture.wrapS = texture.wrapT = RepeatWrapping;
				assets.set("wood-normals", texture);

			});

			textureLoader.load("textures/sun.png", function(texture) {

				assets.set("sun-diffuse", texture);

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
		this.controls.target.set(0, 0.5, 0);

		// Camera.

		camera.position.set(-5, -1, -4);
		camera.lookAt(this.controls.target);
		scene.add(camera);

		// Sky.

		scene.background = assets.get("sky");

		// Lights.

		const ambientLight = new AmbientLight(0x0f0f0f);
		const directionalLight = new DirectionalLight(0xffbbaa);

		directionalLight.position.set(-1, 1, 1);
		directionalLight.target.position.copy(scene.position);

		this.directionalLight = directionalLight;

		scene.add(directionalLight);
		scene.add(ambientLight);

		// Objects.

		const object = assets.get("waggon");
		const material = new MeshPhongMaterial({
			color: 0xffffff,
			map: assets.get("wood-diffuse"),
			normalMap: assets.get("wood-normals"),
			fog: true
		});

		object.traverse(function(child) {

			child.material = material;

		});

		scene.add(object);

		// Sun.

		const sunMaterial = new PointsMaterial({
			map: assets.get("sun-diffuse"),
			size: 100,
			sizeAttenuation: true,
			color: 0xffddaa,
			alphaTest: 0,
			transparent: true,
			fog: false
		});

		const sunGeometry = new BufferGeometry();
		sunGeometry.addAttribute("position", new BufferAttribute(new Float32Array(3), 3));
		const sun = new Points(sunGeometry, sunMaterial);
		sun.frustumCulled = false;
		sun.position.set(75, 25, 100);

		this.sun = sun;
		scene.add(sun);

		// Passes.

		composer.addPass(new RenderPass(scene, camera));

		const pass = new GodRaysPass(scene, camera, sun, {
			resolutionScale: 0.6,
			kernelSize: KernelSize.SMALL,
			intensity: 1.0,
			density: 0.96,
			decay: 0.93,
			weight: 0.4,
			exposure: 0.6,
			samples: 60,
			clampMax: 1.0
		});

		pass.renderToScreen = true;
		this.godRaysPass = pass;
		composer.addPass(pass);

	}

	/**
	 * Registers configuration options.
	 *
	 * @method configure
	 * @param {GUI} gui - A GUI.
	 */

	configure(gui) {

		const directionalLight = this.directionalLight;
		const composer = this.composer;
		const pass = this.godRaysPass;
		const sun = this.sun;

		const params = {
			"resolution": pass.resolutionScale,
			"blurriness": pass.kernelSize,
			"intensity": pass.intensity,
			"density": pass.godRaysMaterial.uniforms.density.value,
			"decay": pass.godRaysMaterial.uniforms.decay.value,
			"weight": pass.godRaysMaterial.uniforms.weight.value,
			"exposure": pass.godRaysMaterial.uniforms.exposure.value,
			"clampMax": pass.godRaysMaterial.uniforms.clampMax.value,
			"samples": pass.samples,
			"color": sun.material.color.getHex(),
			"blend mode": "screen"
		};

		gui.add(params, "resolution").min(0.0).max(1.0).step(0.01).onChange(function() { pass.resolutionScale = params.resolution; composer.setSize(); });
		gui.add(params, "blurriness").min(KernelSize.VERY_SMALL).max(KernelSize.HUGE).step(1).onChange(function() { pass.kernelSize = params.blurriness; });
		gui.add(params, "intensity").min(0.0).max(1.0).step(0.01).onChange(function() { pass.intensity = params.intensity; });
		gui.add(params, "density").min(0.0).max(1.0).step(0.01).onChange(function() { pass.godRaysMaterial.uniforms.density.value = params.density; });
		gui.add(params, "decay").min(0.0).max(1.0).step(0.01).onChange(function() { pass.godRaysMaterial.uniforms.decay.value = params.decay; });
		gui.add(params, "weight").min(0.0).max(1.0).step(0.01).onChange(function() { pass.godRaysMaterial.uniforms.weight.value = params.weight; });
		gui.add(params, "exposure").min(0.0).max(1.0).step(0.01).onChange(function() { pass.godRaysMaterial.uniforms.exposure.value = params.exposure; });
		gui.add(params, "clampMax").min(0.0).max(1.0).step(0.01).onChange(function() { pass.godRaysMaterial.uniforms.clampMax.value = params.clampMax; });
		gui.add(params, "samples").min(15).max(200).step(1).onChange(function() { pass.samples = params.samples; });
		gui.addColor(params, "color").onChange(function() { sun.material.color.setHex(params.color); directionalLight.color.setHex(params.color); });

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
