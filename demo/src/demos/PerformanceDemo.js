import {
	AmbientLight,
	CubeTextureLoader,
	CylinderBufferGeometry,
	FogExp2,
	Mesh,
	MeshBasicMaterial,
	MeshPhongMaterial,
	PerspectiveCamera,
	PointLight,
	TextureLoader,
	SphereBufferGeometry,
	TorusBufferGeometry,
	Vector2,
	WebGLRenderer
} from "three";

import { PostProcessingDemo } from "./PostProcessingDemo.js";

import {
	BlendFunction,
	BloomEffect,
	BrightnessContrastEffect,
	ColorAverageEffect,
	ColorDepthEffect,
	DotScreenEffect,
	EffectPass,
	GammaCorrectionEffect,
	GodRaysEffect,
	GridEffect,
	HueSaturationEffect,
	KernelSize,
	NoiseEffect,
	SepiaEffect,
	ScanlineEffect,
	SMAAEffect,
	VignetteEffect
} from "../../../src";

/**
 * A performance demo setup.
 */

export class PerformanceDemo extends PostProcessingDemo {

	/**
	 * Constructs a new performance demo.
	 *
	 * @param {EffectComposer} composer - An effect composer.
	 */

	constructor(composer) {

		super("performance", composer);

		/**
		 * A renderer that uses a high-performance context.
		 *
		 * @type {WebGLRenderer}
		 * @private
		 */

		this.renderer = null;

		/**
		 * A list of effect.
		 *
		 * @type {Effect[]}
		 * @private
		 */

		this.effects = null;

		/**
		 * An effect pass.
		 *
		 * @type {EffectPass}
		 * @private
		 */

		this.effectPass = null;

		/**
		 * A list of passes.
		 *
		 * @type {Pass[]}
		 * @private
		 */

		this.passes = null;

		/**
		 * A sun.
		 *
		 * @type {Points}
		 * @private
		 */

		this.sun = null;

		/**
		 * A light source.
		 *
		 * @type {PointLight}
		 * @private
		 */

		this.light = null;

		/**
		 * The current frame rate.
		 *
		 * @type {String}
		 */

		this.fps = "0";

		/**
		 * A time accumulator.
		 *
		 * @type {Number}
		 * @private
		 */

		this.acc0 = 0;

		/**
		 * A time accumulator.
		 *
		 * @type {Number}
		 * @private
		 */

		this.acc1 = 0;

		/**
		 * A frame accumulator.
		 *
		 * @type {Number}
		 * @private
		 */

		this.frames = 0;

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

		const path = "textures/skies/space5/";
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

				textureLoader.load("textures/sun.png", function(texture) {

					assets.set("sun-diffuse", texture);

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

		// Create a renderer that uses a high-performance context.

		const renderer = ((renderer) => {

			const size = renderer.getSize(new Vector2());
			const pixelRatio = renderer.getPixelRatio();

			renderer = new WebGLRenderer({
				powerPreference: "high-performance",
				logarithmicDepthBuffer: true,
				antialias: false
			});

			renderer.setSize(size.width, size.height);
			renderer.setPixelRatio(pixelRatio);

			return renderer;

		})(composer.renderer);

		composer.replaceRenderer(renderer);
		this.renderer = renderer;

		// Camera.

		const camera = new PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.3, 2000);
		camera.position.set(-10, 1.125, 0);
		camera.lookAt(scene.position);
		this.camera = camera;

		// Fog.

		scene.fog = new FogExp2(0x000000, 0.0025);
		renderer.setClearColor(scene.fog.color);

		// Sky.

		scene.background = assets.get("sky");

		// Lights.

		const ambientLight = new AmbientLight(0x666666);
		const pointLight = new PointLight(0xffbbaa, 5.5, 12);

		scene.add(ambientLight);
		scene.add(pointLight);

		this.light = pointLight;

		// Objects.

		const material = new MeshPhongMaterial({
			color: 0xffaaaa,
			flatShading: true,
			envMap: assets.get("sky")
		});

		const cylinderGeometry = new CylinderBufferGeometry(1, 1, 20, 6);
		const cylinderMesh = new Mesh(cylinderGeometry, material);
		cylinderMesh.rotation.set(0, 0, Math.PI / 2);
		scene.add(cylinderMesh);

		const torusGeometry = new TorusBufferGeometry(1, 0.4, 16, 100);
		const torusMeshes = [
			new Mesh(torusGeometry, material),
			new Mesh(torusGeometry, material),
			new Mesh(torusGeometry, material)
		];

		torusMeshes[0].position.set(0, 2.5, -5);
		torusMeshes[1].position.set(0, 2.5, 0);
		torusMeshes[2].position.set(0, 2.5, 5);

		scene.add(torusMeshes[0]);
		scene.add(torusMeshes[1]);
		scene.add(torusMeshes[2]);

		// Sun.

		const sunMaterial = new MeshBasicMaterial({
			color: 0xffddaa,
			transparent: true,
			fog: false
		});

		const sunGeometry = new SphereBufferGeometry(0.65, 32, 32);
		const sun = new Mesh(sunGeometry, sunMaterial);
		sun.frustumCulled = false;
		this.sun = sun;

		// Passes.

		this.renderPass.renderToScreen = false;

		const smaaEffect = new SMAAEffect(assets.get("smaa-search"), assets.get("smaa-area"));
		smaaEffect.setEdgeDetectionThreshold(0.06);

		const bloomEffect = new BloomEffect({
			blendFunction: BlendFunction.SCREEN,
			kernelSize: KernelSize.MEDIUM,
			luminanceThreshold: 0.825,
			luminanceSmoothing: 0.075,
			height: 480
		});

		const godRaysEffect = new GodRaysEffect(camera, sun, {
			kernelSize: KernelSize.SMALL,
			height: 720,
			density: 0.96,
			decay: 0.92,
			weight: 0.3,
			exposure: 0.55,
			samples: 60,
			clampMax: 1.0
		});

		const dotScreenEffect = new DotScreenEffect({
			blendFunction: BlendFunction.OVERLAY
		});

		const gridEffect = new GridEffect({
			blendFunction: BlendFunction.DARKEN,
			scale: 2.4,
			lineWidth: 0.0
		});

		const scanlineEffect = new ScanlineEffect({
			blendFunction: BlendFunction.OVERLAY,
			density: 1.04
		});

		const colorAverageEffect = new ColorAverageEffect(BlendFunction.COLOR_DODGE);
		const colorDepthEffect = new ColorDepthEffect({ bits: 16 });
		const sepiaEffect = new SepiaEffect({ blendFunction: BlendFunction.NORMAL });

		const brightnessContrastEffect = new BrightnessContrastEffect({ contrast: 0.0 });
		const gammaCorrectionEffect = new GammaCorrectionEffect({ gamma: 1.1 });
		const hueSaturationEffect = new HueSaturationEffect({ saturation: 0.125 });

		const noiseEffect = new NoiseEffect({ premultiply: true });
		const vignetteEffect = new VignetteEffect();

		godRaysEffect.dithering = true;

		bloomEffect.blendMode.opacity.value = 2.3;
		colorAverageEffect.blendMode.opacity.value = 0.01;
		sepiaEffect.blendMode.opacity.value = 0.01;
		dotScreenEffect.blendMode.opacity.value = 0.01;
		gridEffect.blendMode.opacity.value = 0.01;
		scanlineEffect.blendMode.opacity.value = 0.01;
		noiseEffect.blendMode.opacity.value = 0.25;

		const effects = [
			smaaEffect,
			bloomEffect,
			godRaysEffect,
			colorAverageEffect,
			colorDepthEffect,
			dotScreenEffect,
			gridEffect,
			scanlineEffect,
			brightnessContrastEffect,
			gammaCorrectionEffect,
			hueSaturationEffect,
			sepiaEffect,
			noiseEffect,
			vignetteEffect
		];

		// Merge all effects into one pass.
		const effectPass = new EffectPass(camera, ...effects);
		effectPass.renderToScreen = true;

		// Create a pass for each effect.
		const passes = effects.map((effect) => new EffectPass(camera, effect));
		passes[passes.length - 1].renderToScreen = true;

		// Add all passes to the composer.
		for(const pass of passes) {

			pass.enabled = false;
			composer.addPass(pass);

		}

		composer.addPass(effectPass);

		this.effectPass = effectPass;
		this.effects = effects;
		this.passes = passes;

	}

	/**
	 * Renders this demo.
	 *
	 * @param {Number} delta - The time since the last frame in seconds.
	 */

	render(delta) {

		this.acc0 += delta;
		this.acc1 += delta;

		if(this.acc0 >= 1.0) {

			this.fps = this.frames.toFixed();
			this.acc0 = 0.0;
			this.frames = 0;

		} else {

			++this.frames;

		}

		this.sun.position.set(0, 2.5, Math.sin(this.acc1 * 0.4) * 8);
		this.sun.updateWorldMatrix(true, false);
		this.light.position.copy(this.sun.position);

		super.render(delta);

	}

	/**
	 * Registers configuration options.
	 *
	 * @param {GUI} menu - A menu.
	 */

	registerOptions(menu) {

		const params = {
			"merge effects": true,
			"firefox": function() {

				window.open("https://www.google.com/search?q=firefox+layout.frame_rate", "_blank");

			},
			"chrome": function() {

				window.open("https://www.google.com/search?q=chrome+--disable-gpu-vsync", "_blank");

			}
		};

		menu.add(params, "merge effects").onChange(() => {

			this.effectPass.enabled = params["merge effects"];

			this.passes.forEach((pass) => {

				pass.enabled = !params["merge effects"];

			});

		});

		menu.add(this, "fps").listen();

		const folder = menu.addFolder("Disable VSync");
		folder.add(params, "firefox");
		folder.add(params, "chrome");

	}

	/**
	 * Resets this demo.
	 *
	 * @return {Demo} This demo.
	 */

	reset() {

		super.reset();

		this.acc0 = 0.0;
		this.acc1 = 0.0;
		this.frames = 0;

	}

}
