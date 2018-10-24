import {
	AmbientLight,
	BoxBufferGeometry,
	CubeTextureLoader,
	DirectionalLight,
	FogExp2,
	Mesh,
	MeshPhongMaterial,
	Object3D,
	PerspectiveCamera,
	Scene,
	SphereBufferGeometry
} from "three";

import { DeltaControls } from "delta-controls";
import { PostProcessingDemo } from "./PostProcessingDemo.js";

import {
	ClearMaskPass,
	EffectPass,
	MaskPass,
	PixelationEffect,
	SMAAEffect
} from "../../../src";

/**
 * A pixelation demo setup.
 */

export class PixelationDemo extends PostProcessingDemo {

	/**
	 * Constructs a new pixelation demo.
	 *
	 * @param {EffectComposer} composer - An effect composer.
	 */

	constructor(composer) {

		super("pixelation", composer);

		/**
		 * An effect.
		 *
		 * @type {Effect}
		 * @private
		 */

		this.effect = null;

		/**
		 * An object.
		 *
		 * @type {Object3D}
		 * @private
		 */

		this.object = null;

		/**
		 * A mask pass.
		 *
		 * @type {MaskPass}
		 * @private
		 */

		this.maskPass = null;

		/**
		 * An object used for masking.
		 *
		 * @type {Mesh}
		 * @private
		 */

		this.maskObject = null;

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

		const path = "textures/skies/space/";
		const format = ".jpg";
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

				this.loadSMAAImages();

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
		camera.position.set(10, 1, 10);
		camera.lookAt(scene.position);
		this.camera = camera;

		// Controls.

		const controls = new DeltaControls(camera.position, camera.quaternion, renderer.domElement);
		controls.settings.pointer.lock = false;
		controls.settings.translation.enabled = false;
		controls.settings.sensitivity.zoom = 1.0;
		controls.lookAt(scene.position);
		this.controls = controls;

		// Fog.

		scene.fog = new FogExp2(0x000000, 0.0025);
		renderer.setClearColor(scene.fog.color);

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
				flatShading: true
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

		// Stencil mask scene.

		const maskScene = new Scene();

		mesh = new Mesh(new BoxBufferGeometry(4, 4, 4));
		this.maskObject = mesh;
		maskScene.add(mesh);

		// Passes.

		const smaaEffect = new SMAAEffect(assets.get("smaa-search"), assets.get("smaa-area"));
		const pixelationEffect = new PixelationEffect(5.0);

		const effectPass = new EffectPass(camera, pixelationEffect);
		const maskPass = new MaskPass(maskScene, camera);
		const smaaPass = new EffectPass(camera, smaaEffect);

		this.renderPass.renderToScreen = false;
		smaaPass.renderToScreen = true;

		// The mask pass renders normal geometry and introduces aliasing artifacts.
		composer.addPass(maskPass);
		composer.addPass(effectPass);
		composer.addPass(new ClearMaskPass());
		composer.addPass(smaaPass);

		this.effect = pixelationEffect;
		this.maskPass = maskPass;

	}

	/**
	 * Renders this demo.
	 *
	 * @param {Number} delta - The time since the last frame in seconds.
	 */

	render(delta) {

		const object = this.object;
		const maskObject = this.maskObject;
		const twoPI = 2.0 * Math.PI;
		const time = performance.now() * 0.001;

		object.rotation.x += 0.001;
		object.rotation.y += 0.005;

		if(object.rotation.x >= twoPI) {

			object.rotation.x -= twoPI;

		}

		if(object.rotation.y >= twoPI) {

			object.rotation.y -= twoPI;

		}

		maskObject.position.x = Math.cos(time / 1.5) * 4;
		maskObject.position.y = Math.sin(time) * 4;
		maskObject.rotation.x = time;
		maskObject.rotation.y = time * 0.5;

		super.render(delta);

	}

	/**
	 * Registers configuration options.
	 *
	 * @param {GUI} menu - A menu.
	 */

	registerOptions(menu) {

		const effect = this.effect;
		const maskPass = this.maskPass;

		const params = {
			"use mask": maskPass.enabled,
			"granularity": effect.getGranularity()
		};

		menu.add(params, "granularity").min(0.0).max(50.0).step(0.1).onChange(() => {

			effect.setGranularity(params.granularity);

		});

		menu.add(params, "use mask").onChange(() => {

			maskPass.enabled = params["use mask"];

		});

	}

}
