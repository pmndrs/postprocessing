import { Color, PerspectiveCamera, Vector3 } from "three";
import { SpatialControls } from "spatial-controls";
import { ProgressManager } from "../utils/ProgressManager";
import { PostProcessingDemo } from "./PostProcessingDemo";

import * as Cage from "./objects/Cage";
import * as Sponza from "./objects/Sponza";

import {
	BlendFunction,
	CopyMaterial,
	EdgeDetectionMode,
	EffectPass,
	PredicationMode,
	ShaderPass,
	SMAAEffect,
	SMAAImageLoader,
	SMAAPreset,
	TextureEffect
} from "../../../src";

/**
 * An antialiasing demo setup.
 */

export class AntialiasingDemo extends PostProcessingDemo {

	/**
	 * Constructs a new antialiasing demo.
	 *
	 * @param {EffectComposer} composer - An effect composer.
	 */

	constructor(composer) {

		super("antialiasing", composer);

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
		 * A texture effect (SMAA edges).
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
				loadingManager.onError = (url) => console.error(`Failed to load ${url}`);

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

		// Camera

		const aspect = window.innerWidth / window.innerHeight;
		const camera = new PerspectiveCamera(50, aspect, 0.3, 2000);
		camera.position.set(4, 8, 0.75);
		this.camera = camera;

		// Controls

		const target = new Vector3(-0.5, 6.5, -0.25);
		const controls = new SpatialControls(camera.position, camera.quaternion, renderer.domElement);
		controls.settings.pointer.lock = false;
		controls.settings.translation.enabled = true;
		controls.settings.sensitivity.rotation = 2.2;
		controls.settings.sensitivity.translation = 3.0;
		controls.lookAt(target);
		controls.setOrbitEnabled(false);
		this.controls = controls;

		// Sky

		scene.background = new Color(0xccccff);

		// Lights

		scene.add(...Sponza.createLights());

		// Objects

		scene.add(assets.get(Sponza.tag));

		const cage = Cage.create(0x000000, 1.25, 0.025);
		cage.position.set(-0.5, 6.5, -0.25);

		cage.rotation.x += Math.PI * 0.1;
		cage.rotation.y += Math.PI * 0.3;

		this.object = cage;
		scene.add(cage);

		// Passes

		const smaaEffect = new SMAAEffect(
			assets.get("smaa-search"),
			assets.get("smaa-area"),
			SMAAPreset.HIGH,
			EdgeDetectionMode.COLOR
		);

		smaaEffect.edgeDetectionMaterial.setEdgeDetectionThreshold(0.05);
		smaaEffect.edgeDetectionMaterial.setPredicationMode(PredicationMode.DEPTH);
		smaaEffect.edgeDetectionMaterial.setPredicationThreshold(0.002);
		smaaEffect.edgeDetectionMaterial.setPredicationScale(1.0);

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
	 * Updates this demo.
	 *
	 * @param {Number} deltaTime - The time since the last frame in seconds.
	 */

	update(deltaTime) {

		if(this.rotate) {

			const object = this.object;
			const PI2 = 2.0 * Math.PI;

			object.rotation.x += 0.01 * deltaTime;
			object.rotation.y += 0.05 * deltaTime;

			if(object.rotation.x >= PI2) {

				object.rotation.x -= PI2;

			}

			if(object.rotation.y >= PI2) {

				object.rotation.y -= PI2;

			}

		}

	}

	/**
	 * Registers configuration options.
	 *
	 * @param {GUI} menu - A menu.
	 */

	registerOptions(menu) {

		const composer = this.composer;
		const renderer = composer.getRenderer();
		const context = renderer.getContext();

		const copyPass = this.copyPass;
		const effectPass = this.effectPass;

		const smaaEffect = this.smaaEffect;
		const edgesTextureEffect = this.edgesTextureEffect;
		const weightsTextureEffect = this.weightsTextureEffect;
		const edgeDetectionMaterial = smaaEffect.edgeDetectionMaterial;

		const AAMode = {
			DISABLED: 0,
			SMAA: 1
		};

		if(renderer.capabilities.isWebGL2) {

			Object.assign(AAMode, { MSAA: 2 });

		}

		const SMAAMode = {
			DEFAULT: 0,
			SMAA_EDGES: 1,
			SMAA_WEIGHTS: 2
		};

		const params = {
			"antialiasing": AAMode.SMAA,
			"smaa": {
				"mode": SMAAMode.DEFAULT,
				"preset": SMAAPreset.HIGH,
				"opacity": smaaEffect.blendMode.opacity.value,
				"blend mode": smaaEffect.blendMode.blendFunction
			},
			"edgeDetection": {
				"mode": Number(edgeDetectionMaterial.defines.EDGE_DETECTION_MODE),
				"contrast factor": Number(edgeDetectionMaterial.defines.LOCAL_CONTRAST_ADAPTATION_FACTOR),
				"threshold": Number(edgeDetectionMaterial.defines.EDGE_THRESHOLD)
			},
			"predication": {
				"mode": Number(edgeDetectionMaterial.defines.PREDICATION_MODE),
				"threshold": Number(edgeDetectionMaterial.defines.PREDICATION_THRESHOLD),
				"strength": Number(edgeDetectionMaterial.defines.PREDICATION_STRENGTH),
				"scale": Number(edgeDetectionMaterial.defines.PREDICATION_SCALE)
			}
		};

		// Disable PredicationMode.CUSTOM for the demo.
		delete PredicationMode.CUSTOM;

		menu.add(this, "rotate");

		menu.add(params, "antialiasing", AAMode).onChange((value) => {

			const mode = Number(value);

			effectPass.enabled = (mode === AAMode.SMAA);
			copyPass.enabled = !effectPass.enabled;

			composer.multisampling = (mode !== AAMode.MSAA) ? 0 :
				Math.min(4, context.getParameter(context.MAX_SAMPLES));

		});

		const folder = menu.addFolder("SMAA");

		folder.add(params.smaa, "mode", SMAAMode).onChange((value) => {

			const mode = Number(value);

			edgesTextureEffect.blendMode.setBlendFunction((mode === SMAAMode.SMAA_EDGES) ? BlendFunction.NORMAL : BlendFunction.SKIP);
			weightsTextureEffect.blendMode.setBlendFunction((mode === SMAAMode.SMAA_WEIGHTS) ? BlendFunction.NORMAL : BlendFunction.SKIP);
			effectPass.encodeOutput = (mode !== SMAAMode.SMAA_EDGES && mode !== SMAAMode.SMAA_WEIGHTS);

		});

		folder.add(params.smaa, "preset", SMAAPreset).onChange((value) => {

			smaaEffect.applyPreset(Number(value));
			params.edgeDetection.threshold = Number(edgeDetectionMaterial.defines.EDGE_THRESHOLD);

		});

		let subfolder = folder.addFolder("Edge Detection");

		subfolder.add(params.edgeDetection, "mode", EdgeDetectionMode).onChange((value) => {

			edgeDetectionMaterial.setEdgeDetectionMode(Number(value));

		});

		subfolder.add(params.edgeDetection, "contrast factor").min(1.0).max(3.0).step(0.01).onChange((value) => {

			edgeDetectionMaterial.setLocalContrastAdaptationFactor(Number(value));

		});

		subfolder.add(params.edgeDetection, "threshold").min(0.0).max(0.5).step(0.0001).onChange((value) => {

			edgeDetectionMaterial.setEdgeDetectionThreshold(Number(value));

		}).listen();

		subfolder = folder.addFolder("Predicated Thresholding");

		subfolder.add(params.predication, "mode", PredicationMode).onChange((value) => {

			edgeDetectionMaterial.setPredicationMode(Number(value));

		});

		subfolder.add(params.predication, "threshold").min(0.0).max(0.5).step(0.0001).onChange((value) => {

			edgeDetectionMaterial.setPredicationThreshold(Number(value));

		});

		subfolder.add(params.predication, "strength").min(0.0).max(1.0).step(0.0001).onChange((value) => {

			edgeDetectionMaterial.setPredicationStrength(Number(value));

		});

		subfolder.add(params.predication, "scale").min(1.0).max(5.0).step(0.01).onChange((value) => {

			edgeDetectionMaterial.setPredicationScale(Number(value));

		});

		folder.add(params.smaa, "opacity").min(0.0).max(1.0).step(0.01).onChange((value) => {

			smaaEffect.blendMode.opacity.value = value;

		});

		folder.add(params.smaa, "blend mode", BlendFunction).onChange((value) => {

			smaaEffect.blendMode.setBlendFunction(Number(value));

		});

		folder.open();

	}

}
