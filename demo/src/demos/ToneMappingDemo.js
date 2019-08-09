import {
	AmbientLight,
	BoxBufferGeometry,
	CubeTextureLoader,
	DirectionalLight,
	FogExp2,
	Mesh,
	MeshPhongMaterial,
	PerspectiveCamera,
	RepeatWrapping,
	TextureLoader
} from "three";

import { DeltaControls } from "delta-controls";
import { PostProcessingDemo } from "./PostProcessingDemo.js";

import {
	BlendFunction,
	ToneMappingEffect,
	EffectPass,
	SMAAEffect
} from "../../../src";

/**
 * A tone mapping demo setup.
 */

export class ToneMappingDemo extends PostProcessingDemo {

	/**
	 * Constructs a new tone mapping demo.
	 *
	 * @param {EffectComposer} composer - An effect composer.
	 */

	constructor(composer) {

		super("tone-mapping", composer);

		/**
		 * An effect.
		 *
		 * @type {Effect}
		 * @private
		 */

		this.effect = null;

		/**
		 * A pass.
		 *
		 * @type {Pass}
		 * @private
		 */

		this.pass = null;

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
		const textureLoader = new TextureLoader(loadingManager);
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

				textureLoader.load("textures/crate.jpg", function(texture) {

					texture.wrapS = texture.wrapT = RepeatWrapping;
					assets.set("crate-color", texture);

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
		camera.position.set(-3, 0, -3);
		camera.lookAt(scene.position);
		this.camera = camera;

		// Controls.

		const controls = new DeltaControls(camera.position, camera.quaternion, renderer.domElement);
		controls.settings.pointer.lock = false;
		controls.settings.translation.enabled = false;
		controls.settings.sensitivity.zoom = 1.0;
		controls.settings.zoom.minDistance = 2.5;
		controls.settings.zoom.maxDistance = 40.0;
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

		const smaaEffect = new SMAAEffect(assets.get("smaa-search"), assets.get("smaa-area"));
		smaaEffect.setEdgeDetectionThreshold(0.06);

		const toneMappingEffect = new ToneMappingEffect({
			blendFunction: BlendFunction.NORMAL,
			adaptive: true,
			resolution: 256,
			middleGrey: 0.6,
			maxLuminance: 16.0,
			averageLuminance: 1.0,
			adaptationRate: 2.0
		});

		this.effect = toneMappingEffect;

		const pass = new EffectPass(camera, smaaEffect, toneMappingEffect);
		pass.dithering = true;
		this.pass = pass;

		this.renderPass.renderToScreen = false;
		pass.renderToScreen = true;

		composer.addPass(pass);

	}

	/**
	 * Renders this demo.
	 *
	 * @param {Number} delta - The time since the last frame in seconds.
	 */

	render(delta) {

		const object = this.object;
		const twoPI = 2.0 * Math.PI;

		object.rotation.x += 0.0005;
		object.rotation.y += 0.001;

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

		const pass = this.pass;
		const effect = this.effect;
		const blendMode = effect.blendMode;

		const params = {
			"resolution": effect.resolution,
			"adaptation rate": effect.adaptationRate,
			"average lum": effect.uniforms.get("averageLuminance").value,
			"max lum": effect.uniforms.get("maxLuminance").value,
			"middle grey": effect.uniforms.get("middleGrey").value,
			"opacity": blendMode.opacity.value,
			"blend mode": blendMode.blendFunction
		};

		menu.add(params, "resolution", [64, 128, 256, 512, 1024]).onChange(() => {

			effect.resolution = Number.parseInt(params.resolution);

		});

		let f = menu.addFolder("Luminance");

		f.add(effect, "adaptive").onChange(() => {

			pass.recompile();

		});

		f.add(params, "adaptation rate").min(0.0).max(5.0).step(0.01).onChange(() => {

			effect.adaptationRate = params["adaptation rate"];

		});

		f.add(params, "average lum").min(0.01).max(1.0).step(0.01).onChange(() => {

			effect.uniforms.get("averageLuminance").value = params["average lum"];

		});

		f.add(params, "max lum").min(0.0).max(32.0).step(1).onChange(() => {

			effect.uniforms.get("maxLuminance").value = params["max lum"];

		});

		f.add(params, "middle grey").min(0.0).max(1.0).step(0.01).onChange(() => {

			effect.uniforms.get("middleGrey").value = params["middle grey"];

		});

		f.open();

		menu.add(params, "opacity").min(0.0).max(1.0).step(0.01).onChange(() => {

			blendMode.opacity.value = params.opacity;

		});

		menu.add(params, "blend mode", BlendFunction).onChange(() => {

			blendMode.blendFunction = Number.parseInt(params["blend mode"]);
			pass.recompile();

		});

		menu.add(pass, "dithering");

	}

}
