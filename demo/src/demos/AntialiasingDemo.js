import { Color, PerspectiveCamera, Vector3 } from "three";
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

		const composer = this.composer;
		const renderer = composer.getRenderer();
		const context = renderer.getContext();

		const copyPass = this.copyPass;
		const effectPass = this.effectPass;

		const smaaEffect = this.smaaEffect;
		const edgesTextureEffect = this.edgesTextureEffect;
		const weightsTextureEffect = this.weightsTextureEffect;
		const edgeDetectionMaterial = smaaEffect.edgeDetectionMaterial;

		const AAMode = Object.assign({
			DISABLED: 0,
			SMAA: 1
		}, !renderer.capabilities.isWebGL2 ? {} : {
			MSAA: 2
		});

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
				"edge detection": EdgeDetectionMode.DEPTH,
				"contrast factor": Number(edgeDetectionMaterial.defines.LOCAL_CONTRAST_ADAPTATION_FACTOR),
				"opacity": smaaEffect.blendMode.opacity.value,
				"blend mode": smaaEffect.blendMode.blendFunction
			}
		};

		menu.add(this, "rotate");

		menu.add(params, "antialiasing", AAMode).onChange(() => {

			const mode = Number(params.antialiasing);

			effectPass.enabled = (mode === AAMode.SMAA);
			copyPass.enabled = !effectPass.enabled;

			composer.multisampling = (mode === AAMode.MSAA) ? Math.min(4, context.getParameter(context.MAX_SAMPLES)) : 0;

		});

		const folder = menu.addFolder("SMAA");

		folder.add(params.smaa, "mode", SMAAMode).onChange(() => {

			const mode = Number(params.smaa.mode);

			edgesTextureEffect.blendMode.blendFunction = (mode === SMAAMode.SMAA_EDGES) ? BlendFunction.NORMAL : BlendFunction.SKIP;
			weightsTextureEffect.blendMode.blendFunction = (mode === SMAAMode.SMAA_WEIGHTS) ? BlendFunction.NORMAL : BlendFunction.SKIP;
			effectPass.encodeOutput = (mode !== SMAAMode.SMAA_EDGES && mode !== SMAAMode.SMAA_WEIGHTS);
			effectPass.recompile();

		});

		folder.add(params.smaa, "preset", SMAAPreset).onChange(() => {

			smaaEffect.applyPreset(Number(params.smaa.preset));

		});

		folder.add(params.smaa, "edge detection", EdgeDetectionMode).onChange(() => {

			edgeDetectionMaterial.setEdgeDetectionMode(Number(params.smaa["edge detection"]));

		});

		folder.add(params.smaa, "contrast factor").min(1.0).max(3.0).step(0.01).onChange(() => {

			edgeDetectionMaterial.setLocalContrastAdaptationFactor(Number(params.smaa["contrast factor"]));

		});

		folder.add(params.smaa, "opacity").min(0.0).max(1.0).step(0.01).onChange(() => {

			smaaEffect.blendMode.opacity.value = params.smaa.opacity;

		});

		folder.add(params.smaa, "blend mode", BlendFunction).onChange(() => {

			smaaEffect.blendMode.blendFunction = Number(params.smaa["blend mode"]);
			effectPass.recompile();

		});

		folder.open();

	}

}
