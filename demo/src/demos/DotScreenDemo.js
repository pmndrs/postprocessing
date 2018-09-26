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
	ColorAverageEffect,
	DotScreenEffect,
	EffectPass,
	SMAAEffect
} from "../../../src";

/**
 * A dot screen demo setup.
 */

export class DotScreenDemo extends PostProcessingDemo {

	/**
	 * Constructs a new dot screen demo.
	 *
	 * @param {EffectComposer} composer - An effect composer.
	 */

	constructor(composer) {

		super("dot-screen", composer);

		/**
		 * A dot-screen effect.
		 *
		 * @type {Effect}
		 * @private
		 */

		this.dotScreenEffect = null;

		/**
		 * A color average effect.
		 *
		 * @type {Effect}
		 * @private
		 */

		this.colorAverageEffect = null;

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
		const cubeTextureLoader = new CubeTextureLoader(loadingManager);

		const path = "textures/skies/space3/";
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

				// Preload the SMAA images.
				let image = new Image();
				image.addEventListener("load", function() {

					assets.set("smaa-search", this);
					loadingManager.itemEnd("smaa-search");

				});

				loadingManager.itemStart("smaa-search");
				image.src = SMAAEffect.searchImageDataURL;

				image = new Image();
				image.addEventListener("load", function() {

					assets.set("smaa-area", this);
					loadingManager.itemEnd("smaa-area");

				});

				loadingManager.itemStart("smaa-area");
				image.src = SMAAEffect.areaImageDataURL;

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

		// Passes.

		const smaaEffect = new SMAAEffect(assets.get("smaa-search"), assets.get("smaa-area"));
		const colorAverageEffect = new ColorAverageEffect();
		const dotScreenEffect = new DotScreenEffect({
			blendFunction: BlendFunction.OVERLAY,
			scale: 1.0,
			angle: Math.PI * 0.58
		});

		dotScreenEffect.blendMode.opacity.value = 0.21;

		const pass = new EffectPass(camera, smaaEffect, dotScreenEffect, colorAverageEffect);

		this.dotScreenEffect = dotScreenEffect;
		this.colorAverageEffect = colorAverageEffect;
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
		const dotScreenEffect = this.dotScreenEffect;
		const colorAverageEffect = this.colorAverageEffect;

		const params = {
			"angle": Math.PI * 0.58,
			"scale": dotScreenEffect.uniforms.get("scale").value,
			"opacity": dotScreenEffect.blendMode.opacity.value,
			"blend mode": dotScreenEffect.blendMode.blendFunction,
			"colorAverage": {
				"opacity": colorAverageEffect.blendMode.opacity.value,
				"blend mode": colorAverageEffect.blendMode.blendFunction
			}
		};

		menu.add(params, "angle").min(0.0).max(Math.PI).step(0.001).onChange(() => {

			dotScreenEffect.setAngle(params.angle);

		});

		menu.add(params, "scale").min(0.0).max(1.0).step(0.01).onChange(() => {

			dotScreenEffect.uniforms.get("scale").value = params.scale;

		});

		menu.add(params, "opacity").min(0.0).max(1.0).step(0.01).onChange(() => {

			dotScreenEffect.blendMode.opacity.value = params.opacity;

		});

		menu.add(params, "blend mode", BlendFunction).onChange(() => {

			dotScreenEffect.blendMode.blendFunction = Number.parseInt(params["blend mode"]);
			pass.recompile();

		});

		const folder = menu.addFolder("Color Average");

		folder.add(params.colorAverage, "opacity").min(0.0).max(1.0).step(0.01).onChange(() => {

			colorAverageEffect.blendMode.opacity.value = params.colorAverage.opacity;

		});

		folder.add(params.colorAverage, "blend mode", BlendFunction).onChange(() => {

			colorAverageEffect.blendMode.blendFunction = Number.parseInt(params.colorAverage["blend mode"]);
			pass.recompile();

		});

	}

}
