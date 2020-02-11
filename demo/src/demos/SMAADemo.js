import {
	Color,
	PerspectiveCamera,
	Vector2,
	Vector3,
	WebGLRenderer
} from "three";

import { DeltaControls } from "delta-controls";
import { ProgressManager } from "../utils/ProgressManager.js";
import { Cage } from "./objects/Cage.js";
import { Sponza } from "./objects/Sponza.js";
import { PostProcessingDemo } from "./PostProcessingDemo.js";

import {
	BlendFunction,
	CopyMaterial,
	EdgeDetectionMode,
	EffectPass,
	ShaderPass,
	SMAAEffect,
	SMAAImageLoader,
	SMAAPreset,
	TextureEffect
} from "../../../src";

/**
 * An SMAA demo setup.
 */

export class SMAADemo extends PostProcessingDemo {

	/**
	 * Constructs a new SMAA demo.
	 *
	 * @param {EffectComposer} composer - An effect composer.
	 */

	constructor(composer) {

		super("smaa", composer);

		/**
		 * A secondary renderer.
		 *
		 * @type {WebGLRenderer}
		 * @private
		 */

		this.secondaryRenderer = null;

		/**
		 * An SMAA effect.
		 *
		 * @type {Effect}
		 * @private
		 */

		this.smaaEffect = null;

		/**
		 * A copy pass.
		 *
		 * @type {Pass}
		 * @private
		 */

		this.copyPass = null;

		/**
		 * An effect pass.
		 *
		 * @type {Pass}
		 * @private
		 */

		this.effectPass = null;

		/**
		 * A texture effect (SMAA color edges).
		 *
		 * @type {Effect}
		 * @private
		 */

		this.edgesTextureEffect = null;

		/**
		 * A texture effect (SMAA weights).
		 *
		 * @type {Effect}
		 * @private
		 */

		this.weightsTextureEffect = null;

		/**
		 * An object.
		 *
		 * @type {Object3D}
		 * @private
		 */

		this.object = null;

		/**
		 * Indicates whether the object should rotate.
		 *
		 * @type {Boolean}
		 * @private
		 */

		this.rotate = true;

	}

	/**
	 * Loads scene assets.
	 *
	 * @return {Promise} A promise that will be fulfilled as soon as all assets have been loaded.
	 */

	load() {

		const assets = this.assets;
		const loadingManager = this.loadingManager;
		const smaaImageLoader = new SMAAImageLoader(loadingManager);

		const anisotropy = Math.min(this.composer.getRenderer().capabilities.getMaxAnisotropy(), 8);

		return new Promise((resolve, reject) => {

			if(assets.size === 0) {

				loadingManager.onLoad = () => setTimeout(resolve, 250);
				loadingManager.onProgress = ProgressManager.updateProgress;
				loadingManager.onError = reject;

				Sponza.load(assets, loadingManager, anisotropy);

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

		// Create a secondary renderer that uses MSAA.

		this.secondaryRenderer = ((primary) => {

			const renderer = new WebGLRenderer({
				powerPreference: "high-performance",
				antialias: true
			});

			const size = primary.getSize(new Vector2());
			renderer.setSize(size.width, size.height);
			renderer.setClearColor(primary.getClearColor(), primary.getClearAlpha());
			renderer.setPixelRatio(primary.getPixelRatio());
			renderer.outputEncoding = primary.outputEncoding;
			renderer.shadowMap.type = primary.shadowMap.type;
			renderer.shadowMap.autoUpdate = false;
			renderer.shadowMap.needsUpdate = true;
			renderer.shadowMap.enabled = true;

			return renderer;

		})(renderer);

		// Camera.

		const aspect = window.innerWidth / window.innerHeight;
		const camera = new PerspectiveCamera(50, aspect, 0.5, 2000);
		camera.position.set(4, 8, 0.75);
		this.camera = camera;

		// Controls.

		const target = new Vector3(-0.5, 6.5, -0.25);
		const controls = new DeltaControls(camera.position, camera.quaternion, renderer.domElement);
		controls.settings.pointer.lock = false;
		controls.settings.translation.enabled = true;
		controls.settings.sensitivity.translation = 3.0;
		controls.lookAt(target);
		controls.setOrbitEnabled(false);
		this.controls = controls;

		// Sky.

		scene.background = new Color(0xccccff);

		// Lights.

		scene.add(...Sponza.createLights());

		// Objects.

		scene.add(assets.get("sponza"));

		const cage = Cage.create(0x000000, 1.25, 0.025);
		cage.position.set(-0.5, 6.5, -0.25);

		cage.rotation.x += Math.PI * 0.1;
		cage.rotation.y += Math.PI * 0.3;

		this.object = cage;
		scene.add(cage);

		// Passes.

		const smaaEffect = new SMAAEffect(
			assets.get("smaa-search"),
			assets.get("smaa-area"),
			SMAAPreset.HIGH,
			EdgeDetectionMode.DEPTH
		);

		const edgesTextureEffect = new TextureEffect({
			blendFunction: BlendFunction.SKIP,
			texture: smaaEffect.renderTargetEdges.texture
		});

		const weightsTextureEffect = new TextureEffect({
			blendFunction: BlendFunction.SKIP,
			texture: smaaEffect.renderTargetWeights.texture
		});

		const copyPass = new ShaderPass(new CopyMaterial());

		const effectPass = new EffectPass(
			camera,
			smaaEffect,
			edgesTextureEffect,
			weightsTextureEffect
		);

		this.smaaEffect = smaaEffect;
		this.edgesTextureEffect = edgesTextureEffect;
		this.weightsTextureEffect = weightsTextureEffect;
		this.copyPass = copyPass;
		this.effectPass = effectPass;

		copyPass.enabled = false;
		copyPass.renderToScreen = true;
		effectPass.renderToScreen = true;

		composer.addPass(copyPass);
		composer.addPass(effectPass);

	}

	/**
	 * Renders this demo.
	 *
	 * @param {Number} delta - The time since the last frame in seconds.
	 */

	render(delta) {

		if(this.rotate) {

			const object = this.object;
			const PI2 = 2.0 * Math.PI;

			object.rotation.x += 0.01 * delta;
			object.rotation.y += 0.05 * delta;

			if(object.rotation.x >= PI2) {

				object.rotation.x -= PI2;

			}

			if(object.rotation.y >= PI2) {

				object.rotation.y -= PI2;

			}

		}

		super.render(delta);

	}

	/**
	 * Registers configuration options.
	 *
	 * @param {GUI} menu - A menu.
	 */

	registerOptions(menu) {

		const scene = this.scene;
		const controls = this.controls;
		const composer = this.composer;
		const renderer1 = composer.getRenderer();
		const renderer2 = this.secondaryRenderer;

		const copyPass = this.copyPass;
		const renderPass = this.renderPass;
		const effectPass = this.effectPass;

		const smaaEffect = this.smaaEffect;
		const edgesTextureEffect = this.edgesTextureEffect;
		const weightsTextureEffect = this.weightsTextureEffect;

		const blendMode = smaaEffect.blendMode;
		const edgeDetectionMaterial = smaaEffect.edgeDetectionMaterial;

		const AAMode = {
			DISABLED: 0,
			BROWSER: 1,
			SMAA_EDGES: 2,
			SMAA_WEIGHTS: 3,
			SMAA: 4
		};

		const params = {
			"AA mode": AAMode.SMAA,
			"preset": SMAAPreset.HIGH,
			"edge detection": EdgeDetectionMode.DEPTH,
			"contrast factor": Number(edgeDetectionMaterial.defines.LOCAL_CONTRAST_ADAPTATION_FACTOR),
			"opacity": this.smaaEffect.blendMode.opacity.value,
			"blend mode": this.smaaEffect.blendMode.blendFunction
		};

		function swapRenderers(browser) {

			const size = composer.getRenderer().getSize(new Vector2());

			if(browser && composer.getRenderer() !== renderer2) {

				scene.background.convertLinearToSRGB();
				renderer2.setSize(size.width, size.height);
				composer.replaceRenderer(renderer2);
				controls.setDom(renderer2.domElement);

			} else {

				scene.background.set(0x777777);
				renderer1.setSize(size.width, size.height);
				composer.replaceRenderer(renderer1);
				controls.setDom(renderer1.domElement);

			}

		}

		function toggleAAMode() {

			const mode = Number(params["AA mode"]);

			renderPass.renderToScreen = (mode === AAMode.BROWSER);
			effectPass.enabled = (mode === AAMode.SMAA || mode === AAMode.SMAA_EDGES || mode === AAMode.SMAA_WEIGHTS);
			copyPass.enabled = (mode === AAMode.DISABLED);

			edgesTextureEffect.blendMode.blendFunction = (mode === AAMode.SMAA_EDGES) ? BlendFunction.NORMAL : BlendFunction.SKIP;
			weightsTextureEffect.blendMode.blendFunction = (mode === AAMode.SMAA_WEIGHTS) ? BlendFunction.NORMAL : BlendFunction.SKIP;
			effectPass.encodeOutput = (mode !== AAMode.SMAA_EDGES && mode !== AAMode.SMAA_WEIGHTS);
			effectPass.recompile();

			swapRenderers(mode === AAMode.BROWSER);

		}

		menu.add(this, "rotate");

		menu.add(params, "AA mode", AAMode).onChange(toggleAAMode);

		menu.add(params, "preset", SMAAPreset).onChange(() => {

			smaaEffect.applyPreset(Number(params.preset));

		});

		menu.add(params, "edge detection", EdgeDetectionMode).onChange(() => {

			edgeDetectionMaterial.setEdgeDetectionMode(Number(params["edge detection"]));

		});

		menu.add(params, "contrast factor").min(1.0).max(3.0).step(0.01).onChange(() => {

			edgeDetectionMaterial.setLocalContrastAdaptationFactor(Number(params["contrast factor"]));

		});

		menu.add(params, "opacity").min(0.0).max(1.0).step(0.01).onChange(() => {

			blendMode.opacity.value = params.opacity;

		});

		menu.add(params, "blend mode", BlendFunction).onChange(() => {

			blendMode.blendFunction = Number(params["blend mode"]);
			effectPass.recompile();

		});

	}

	/**
	 * Resets this demo.
	 *
	 * @return {Demo} This demo.
	 */

	reset() {

		super.reset();

		if(this.secondaryRenderer !== null) {

			this.secondaryRenderer.dispose();
			this.secondaryRenderer = null;

		}

	}

}
