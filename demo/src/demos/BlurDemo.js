import {
	AmbientLight,
	CubeTextureLoader,
	DirectionalLight,
	FogExp2,
	Mesh,
	MeshPhongMaterial,
	Object3D,
	PerspectiveCamera,
	SphereBufferGeometry
} from "three";

import { DeltaControls } from "delta-controls";
import { PostProcessingDemo } from "./PostProcessingDemo.js";

import {
	BlendFunction,
	BlurPass,
	EffectPass,
	KernelSize,
	SavePass,
	SMAAEffect,
	TextureEffect
} from "../../../src";

/**
 * A blur demo setup.
 */

export class BlurDemo extends PostProcessingDemo {

	/**
	 * Constructs a new blur demo.
	 *
	 * @param {EffectComposer} composer - An effect composer.
	 */

	constructor(composer) {

		super("blur", composer);

		/**
		 * A blur pass.
		 *
		 * @type {Pass}
		 * @private
		 */

		this.blurPass = null;

		/**
		 * A texture pass.
		 *
		 * @type {Pass}
		 * @private
		 */

		this.texturePass = null;

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

		const path = "textures/skies/sunset/";
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
		camera.position.set(-15, 0, -15);
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

		directionalLight.position.set(1440, 200, 2000);
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

		// Passes.

		const savePass = new SavePass();
		const blurPass = new BlurPass({
			height: 480
		});

		const smaaEffect = new SMAAEffect(assets.get("smaa-search"), assets.get("smaa-area"));
		const textureEffect = new TextureEffect({
			texture: savePass.renderTarget.texture
		});

		const smaaPass = new EffectPass(camera, smaaEffect);
		const texturePass = new EffectPass(camera, textureEffect);

		textureEffect.blendMode.opacity.value = 0.0;

		this.renderPass.renderToScreen = false;
		texturePass.renderToScreen = true;

		this.blurPass = blurPass;
		this.texturePass = texturePass;
		this.effect = textureEffect;

		composer.addPass(smaaPass);
		composer.addPass(savePass);
		composer.addPass(blurPass);
		composer.addPass(texturePass);

	}

	/**
	 * Renders this demo.
	 *
	 * @param {Number} delta - The time since the last frame in seconds.
	 */

	render(delta) {

		const object = this.object;
		const twoPI = 2.0 * Math.PI;

		object.rotation.x += 0.001;
		object.rotation.y += 0.005;

		if(object.rotation.x >= twoPI) {

			object.rotation.x -= twoPI;

		}

		if(object.rotation.y >= twoPI) {

			object.rotation.y -= twoPI;

		}

		super.render(delta);

	}

	/**
	 * Registers configuration options.
	 *
	 * @param {GUI} menu - A menu.
	 */

	registerOptions(menu) {

		const effect = this.effect;
		const pass = this.texturePass;
		const blurPass = this.blurPass;
		const blendMode = effect.blendMode;

		const params = {
			"enabled": blurPass.enabled,
			"resolution": blurPass.height,
			"kernel size": blurPass.kernelSize,
			"scale": blurPass.scale,
			"opacity": 1.0 - blendMode.opacity.value,
			"blend mode": blendMode.blendFunction
		};

		menu.add(params, "resolution", [240, 360, 480, 720, 1080]).onChange(() => {

			blurPass.height = Number.parseInt(params.resolution);

		});

		menu.add(params, "kernel size", KernelSize).onChange(() => {

			blurPass.kernelSize = Number.parseInt(params["kernel size"]);

		});

		menu.add(params, "scale").min(0.0).max(1.0).step(0.01).onChange(() => {

			blurPass.scale = Number.parseFloat(params.scale);

		});

		menu.add(blurPass, "dithering");
		menu.add(blurPass, "enabled");

		menu.add(params, "opacity").min(0.0).max(1.0).step(0.01).onChange(() => {

			blendMode.opacity.value = 1.0 - params.opacity;

		});

		menu.add(params, "blend mode", BlendFunction).onChange(() => {

			blendMode.blendFunction = Number.parseInt(params["blend mode"]);
			pass.recompile();

		});

	}

}
