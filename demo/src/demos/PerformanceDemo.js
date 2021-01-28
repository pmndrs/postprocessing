import {
	AmbientLight,
	CubeTextureLoader,
	CylinderBufferGeometry,
	Mesh,
	MeshBasicMaterial,
	MeshPhongMaterial,
	PerspectiveCamera,
	PointLight,
	RepeatWrapping,
	SphereBufferGeometry,
	sRGBEncoding,
	TextureLoader,
	TorusBufferGeometry
} from "three";

import { ProgressManager } from "../utils/ProgressManager";
import { PostProcessingDemo } from "./PostProcessingDemo";

import {
	BlendFunction,
	BloomEffect,
	BrightnessContrastEffect,
	ColorAverageEffect,
	ColorDepthEffect,
	DotScreenEffect,
	EdgeDetectionMode,
	EffectPass,
	GodRaysEffect,
	GridEffect,
	HueSaturationEffect,
	KernelSize,
	LookupTexture3D,
	LUTEffect,
	NoiseEffect,
	SepiaEffect,
	ScanlineEffect,
	SMAAEffect,
	SMAAImageLoader,
	SMAAPreset,
	TextureEffect,
	ToneMappingEffect,
	ToneMappingMode,
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
	 * @return {Promise} A promise that returns a collection of assets.
	 */

	load() {

		const assets = this.assets;
		const loadingManager = this.loadingManager;
		const textureLoader = new TextureLoader(loadingManager);
		const cubeTextureLoader = new CubeTextureLoader(loadingManager);
		const smaaImageLoader = new SMAAImageLoader(loadingManager);

		const path = "textures/skies/space-dark/";
		const format = ".jpg";
		const urls = [
			path + "px" + format, path + "nx" + format,
			path + "py" + format, path + "ny" + format,
			path + "pz" + format, path + "nz" + format
		];

		return new Promise((resolve, reject) => {

			if(assets.size === 0) {

				loadingManager.onLoad = () => setTimeout(resolve, 250);
				loadingManager.onProgress = ProgressManager.updateProgress;
				loadingManager.onError = (url) => console.error(`Failed to load ${url}`);

				cubeTextureLoader.load(urls, (t) => {

					t.encoding = sRGBEncoding;
					assets.set("sky", t);

				});

				textureLoader.load("textures/scratches.jpg", (t) => {

					t.encoding = sRGBEncoding;
					t.wrapS = t.wrapT = RepeatWrapping;
					assets.set("scratches-color", t);

				});

				smaaImageLoader.load(([search, area]) => {

					assets.set("smaa-search", search);
					assets.set("smaa-area", area);

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
		const renderer = composer.getRenderer();
		const capabilities = renderer.capabilities;

		// Camera

		const aspect = window.innerWidth / window.innerHeight;
		const camera = new PerspectiveCamera(50, aspect, 0.3, 2000);
		camera.position.set(-10, 1.125, 0);
		camera.lookAt(scene.position);
		this.camera = camera;

		// Sky

		scene.background = assets.get("sky");

		// Lights

		const ambientLight = new AmbientLight(0x323232);
		const pointLight = new PointLight(0xffbbaa, 80, 12);

		this.light = pointLight;
		scene.add(ambientLight, pointLight);

		// Objects

		const material = new MeshPhongMaterial({
			envMap: assets.get("sky"),
			color: 0xffaaaa,
			flatShading: true
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

		// Sun

		const sunMaterial = new MeshBasicMaterial({
			color: 0xffddaa,
			transparent: true,
			fog: false
		});

		const sunGeometry = new SphereBufferGeometry(0.65, 32, 32);
		const sun = new Mesh(sunGeometry, sunMaterial);
		sun.frustumCulled = false;
		this.sun = sun;

		// Passes

		const smaaEffect = new SMAAEffect(
			assets.get("smaa-search"),
			assets.get("smaa-area"),
			SMAAPreset.HIGH,
			EdgeDetectionMode.DEPTH
		);

		smaaEffect.edgeDetectionMaterial.setEdgeDetectionThreshold(0.01);

		const bloomEffect = new BloomEffect({
			blendFunction: BlendFunction.ADD,
			kernelSize: KernelSize.MEDIUM,
			luminanceThreshold: 0.825,
			luminanceSmoothing: 0.075,
			height: 480
		});

		const godRaysEffect = new GodRaysEffect(camera, sun, {
			kernelSize: KernelSize.SMALL,
			height: 480,
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

		const textureEffect = new TextureEffect({
			blendFunction: BlendFunction.REFLECT,
			texture: assets.get("scratches-color")
		});

		const colorAverageEffect = new ColorAverageEffect(BlendFunction.COLOR_DODGE);
		const colorDepthEffect = new ColorDepthEffect({ bits: 56 });
		const sepiaEffect = new SepiaEffect({ blendFunction: BlendFunction.NORMAL });

		const brightnessContrastEffect = new BrightnessContrastEffect({ contrast: 0.0 });
		const hueSaturationEffect = new HueSaturationEffect({ saturation: 0.125 });

		const noiseEffect = new NoiseEffect({ premultiply: true });
		const vignetteEffect = new VignetteEffect();

		const lut = LookupTexture3D.createNeutral(8);
		const lutEffect = capabilities.isWebGL2 ? new LUTEffect(lut) :
			new LUTEffect(lut.convertToUint8().toDataTexture());

		const toneMappingEffect = new ToneMappingEffect({
			mode: ToneMappingMode.REINHARD2_ADAPTIVE
		});

		colorAverageEffect.blendMode.opacity.value = 0.01;
		sepiaEffect.blendMode.opacity.value = 0.01;
		dotScreenEffect.blendMode.opacity.value = 0.01;
		gridEffect.blendMode.opacity.value = 0.01;
		scanlineEffect.blendMode.opacity.value = 0.01;
		textureEffect.blendMode.opacity.value = 0.8;
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
			hueSaturationEffect,
			sepiaEffect,
			textureEffect,
			noiseEffect,
			vignetteEffect,
			toneMappingEffect,
			lutEffect
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
	 * Updates this demo.
	 *
	 * @param {Number} deltaTime - The time since the last frame in seconds.
	 */

	update(deltaTime) {

		this.acc0 += deltaTime;
		this.acc1 += deltaTime;

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

	}

	/**
	 * Registers configuration options.
	 *
	 * @param {GUI} menu - A menu.
	 */

	registerOptions(menu) {

		const infoOptions = [];

		const params = {
			"effects": this.effectPass.effects.length,
			"merge effects": true,
			"firefox": () => window.open("https://www.google.com/search?q=firefox+layout.frame_rate", "_blank"),
			"chrome": () => window.open("https://www.google.com/search?q=chrome+--disable-frame-rate-limit --disable-gpu-vsync", "_blank")
		};

		infoOptions.push(menu.add(params, "effects"));

		menu.add(params, "merge effects").onChange((value) => {

			this.effectPass.enabled = value;

			for(const pass of this.passes) {

				pass.enabled = !value;

			}

		});

		infoOptions.push(menu.add(this, "fps").listen());

		const folder = menu.addFolder("Disable VSync");
		folder.add(params, "firefox");
		folder.add(params, "chrome");

		for(const option of infoOptions) {

			option.domElement.style.pointerEvents = "none";

		}

	}

	/**
	 * Disposes this demo.
	 */

	dispose() {

		this.acc0 = 0.0;
		this.acc1 = 0.0;
		this.frames = 0;

	}

}
