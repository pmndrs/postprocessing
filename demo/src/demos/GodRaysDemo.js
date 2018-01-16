import {
	AmbientLight,
	BufferAttribute,
	BufferGeometry,
	CubeTextureLoader,
	DirectionalLight,
	FogExp2,
	MeshPhongMaterial,
	ObjectLoader,
	PerspectiveCamera,
	Points,
	PointsMaterial,
	RepeatWrapping,
	TextureLoader,
	Vector3
} from "three";

import { DeltaControls } from "delta-controls";
import { Demo } from "three-demo";
import { GodRaysPass, KernelSize } from "../../../src";

/**
 * A god rays demo setup.
 */

export class GodRaysDemo extends Demo {

	/**
	 * Constructs a new god rays demo.
	 */

	constructor() {

		super("god-rays");

		/**
		 * A god rays pass.
		 *
		 * @type {GodRaysPass}
		 * @private
		 */

		this.godRaysPass = null;

		/**
		 * A sun.
		 *
		 * @type {Points}
		 * @private
		 */

		this.sun = null;

		/**
		 * A directional light.
		 *
		 * @type {DirectionalLight}
		 * @private
		 */

		this.directionalLight = null;

	}

	/**
	 * Loads scene assets.
	 *
	 * @return {Promise} A promise that will be fulfilled as soon as all assets have been loaded.
	 */

	load() {

		const assets = this.assets;
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

		return new Promise((resolve, reject) => {

			if(assets.size === 0) {

				loadingManager.onError = reject;
				loadingManager.onProgress = (item, loaded, total) => {

					if(loaded === total) {

						resolve();

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

				resolve();

			}

		});

	}

	/**
	 * Creates the scene.
	 */

	initialize() {

		const scene = this.scene;
		const assets = this.assets;
		const composer = this.composer;
		const renderer = composer.renderer;

		// Camera.

		const camera = new PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 2000);
		camera.position.set(-5, -1, -4);
		this.camera = camera;

		// Controls.

		const target = new Vector3(0, 0.5, 0);
		const controls = new DeltaControls(camera.position, camera.quaternion, renderer.domElement);
		controls.settings.pointer.lock = false;
		controls.settings.translation.enabled = false;
		controls.settings.sensitivity.rotation = 0.00125;
		controls.settings.sensitivity.zoom = 1.0;
		controls.lookAt(target);
		this.controls = controls;

		// Fog.

		scene.fog = new FogExp2(0x000000, 0.0025);
		renderer.setClearColor(scene.fog.color);

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

		this.renderPass.renderToScreen = false;
		pass.renderToScreen = true;
		pass.dithering = true;
		this.godRaysPass = pass;
		composer.addPass(pass);

	}

	/**
	 * Registers configuration options.
	 *
	 * @param {GUI} menu - A menu.
	 */

	registerOptions(menu) {

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

		menu.add(params, "resolution").min(0.0).max(1.0).step(0.01).onChange(function() {

			pass.resolutionScale = params.resolution;
			composer.setSize();

		});

		menu.add(pass, "dithering");

		menu.add(params, "blurriness").min(KernelSize.VERY_SMALL).max(KernelSize.HUGE).step(1).onChange(function() {

			pass.kernelSize = params.blurriness;

		});

		menu.add(params, "intensity").min(0.0).max(1.0).step(0.01).onChange(function() {

			pass.intensity = params.intensity;

		});

		menu.add(params, "density").min(0.0).max(1.0).step(0.01).onChange(function() {

			pass.godRaysMaterial.uniforms.density.value = params.density;

		});

		menu.add(params, "decay").min(0.0).max(1.0).step(0.01).onChange(function() {

			pass.godRaysMaterial.uniforms.decay.value = params.decay;

		});

		menu.add(params, "weight").min(0.0).max(1.0).step(0.01).onChange(function() {

			pass.godRaysMaterial.uniforms.weight.value = params.weight;

		});

		menu.add(params, "exposure").min(0.0).max(1.0).step(0.01).onChange(function() {

			pass.godRaysMaterial.uniforms.exposure.value = params.exposure;

		});

		menu.add(params, "clampMax").min(0.0).max(1.0).step(0.01).onChange(function() {

			pass.godRaysMaterial.uniforms.clampMax.value = params.clampMax;

		});

		menu.add(params, "samples").min(15).max(200).step(1).onChange(function() {

			pass.samples = params.samples;

		});

		menu.addColor(params, "color").onChange(function() {

			sun.material.color.setHex(params.color);
			directionalLight.color.setHex(params.color);

		});

		menu.add(params, "blend mode", ["add", "screen"]).onChange(function() {

			pass.combineMaterial.setScreenModeEnabled(params["blend mode"] !== "add");

		});

	}

}
