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
	DotScreenEffect,
	GridEffect,
	EffectPass,
	ScanlineEffect
} from "../../../src";

/**
 * A pattern demo setup.
 */

export class PatternDemo extends PostProcessingDemo {

	/**
	 * Constructs a new pattern demo.
	 *
	 * @param {EffectComposer} composer - An effect composer.
	 */

	constructor(composer) {

		super("pattern", composer);

		/**
		 * A dot-screen effect.
		 *
		 * @type {Effect}
		 * @private
		 */

		this.dotScreenEffect = null;

		/**
		 * A grid effect.
		 *
		 * @type {Effect}
		 * @private
		 */

		this.gridEffect = null;

		/**
		 * A scanline effect.
		 *
		 * @type {Effect}
		 * @private
		 */

		this.scanlineEffect = null;

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

		const dotScreenEffect = new DotScreenEffect({
			blendFunction: BlendFunction.OVERLAY,
			scale: 0.9,
			angle: Math.PI * 0.58
		});

		const gridEffect = new GridEffect({
			blendFunction: BlendFunction.SKIP,
			scale: 1.75,
			lineWidth: 0.25
		});

		const scanlineEffect = new ScanlineEffect({
			blendFunction: BlendFunction.SKIP,
			density: 1.5
		});

		const pass = new EffectPass(camera, dotScreenEffect, gridEffect, scanlineEffect);

		this.dotScreenEffect = dotScreenEffect;
		this.gridEffect = gridEffect;
		this.scanlineEffect = scanlineEffect;

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
		const gridEffect = this.gridEffect;
		const scanlineEffect = this.scanlineEffect;

		const params = {
			dotScreen: {
				"angle": Math.PI * 0.58,
				"scale": dotScreenEffect.uniforms.get("scale").value,
				"opacity": dotScreenEffect.blendMode.opacity.value,
				"blend mode": dotScreenEffect.blendMode.blendFunction
			},
			grid: {
				"scale": gridEffect.getScale(),
				"line width": gridEffect.getLineWidth(),
				"opacity": gridEffect.blendMode.opacity.value,
				"blend mode": gridEffect.blendMode.blendFunction
			},
			scanline: {
				"density": scanlineEffect.getDensity(),
				"opacity": scanlineEffect.blendMode.opacity.value,
				"blend mode": scanlineEffect.blendMode.blendFunction
			}
		};

		let folder = menu.addFolder("Dot Screen");

		folder.add(params.dotScreen, "angle").min(0.0).max(Math.PI).step(0.001).onChange(() => {

			dotScreenEffect.setAngle(params.dotScreen.angle);

		});

		folder.add(params.dotScreen, "scale").min(0.0).max(1.0).step(0.01).onChange(() => {

			dotScreenEffect.uniforms.get("scale").value = params.dotScreen.scale;

		});

		folder.add(params.dotScreen, "opacity").min(0.0).max(1.0).step(0.01).onChange(() => {

			dotScreenEffect.blendMode.opacity.value = params.dotScreen.opacity;

		});

		folder.add(params.dotScreen, "blend mode", BlendFunction).onChange(() => {

			dotScreenEffect.blendMode.blendFunction = Number.parseInt(params.dotScreen["blend mode"]);
			pass.recompile();

		});

		folder.open();

		folder = menu.addFolder("Grid");

		folder.add(params.grid, "scale").min(0.01).max(3.0).step(0.01).onChange(() => {

			gridEffect.setScale(params.grid.scale);

		});

		folder.add(params.grid, "line width").min(0.0).max(1.0).step(0.01).onChange(() => {

			gridEffect.setLineWidth(params.grid["line width"]);

		});

		folder.add(params.grid, "opacity").min(0.0).max(1.0).step(0.01).onChange(() => {

			gridEffect.blendMode.opacity.value = params.grid.opacity;

		});

		folder.add(params.grid, "blend mode", BlendFunction).onChange(() => {

			gridEffect.blendMode.blendFunction = Number.parseInt(params.grid["blend mode"]);
			pass.recompile();

		});

		folder.open();

		folder = menu.addFolder("Scanline");

		folder.add(params.scanline, "density").min(0.001).max(2.0).step(0.001).onChange(() => {

			scanlineEffect.setDensity(params.scanline.density);

		});

		folder.add(params.scanline, "opacity").min(0.0).max(1.0).step(0.01).onChange(() => {

			scanlineEffect.blendMode.opacity.value = params.scanline.opacity;

		});

		folder.add(params.scanline, "blend mode", BlendFunction).onChange(() => {

			scanlineEffect.blendMode.blendFunction = Number.parseInt(params.scanline["blend mode"]);
			pass.recompile();

		});

		folder.open();

	}

}
