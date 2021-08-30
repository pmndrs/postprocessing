import { Color, PerspectiveCamera, TextureLoader } from "three";
import { SpatialControls } from "spatial-controls";
import { calculateVerticalFoV } from "three-demo";
import { ProgressManager } from "../utils/ProgressManager";
import { PostProcessingDemo } from "./PostProcessingDemo";

import * as Sponza from "./objects/Sponza";

import {
	BlendFunction,
	ChromaticAberrationEffect,
	EdgeDetectionMode,
	EffectPass,
	GlitchMode,
	GlitchEffect,
	NoiseEffect,
	SMAAEffect,
	SMAAImageLoader,
	SMAAPreset
} from "../../../src";

/**
 * A glitch demo.
 */

export class GlitchDemo extends PostProcessingDemo {

	/**
	 * Constructs a new glitch demo.
	 *
	 * @param {EffectComposer} composer - An effect composer.
	 */

	constructor(composer) {

		super("glitch", composer);

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

	}

	load() {

		const assets = this.assets;
		const loadingManager = this.loadingManager;
		const textureLoader = new TextureLoader(loadingManager);
		const smaaImageLoader = new SMAAImageLoader(loadingManager);

		const anisotropy = Math.min(this.composer.getRenderer()
			.capabilities.getMaxAnisotropy(), 8);

		return new Promise((resolve, reject) => {

			if(assets.size === 0) {

				loadingManager.onLoad = () => setTimeout(resolve, 250);
				loadingManager.onProgress = ProgressManager.updateProgress;
				loadingManager.onError = url => console.error(`Failed to load ${url}`);

				Sponza.load(assets, loadingManager, anisotropy);

				textureLoader.load("textures/perturb.jpg", (t) => {

					assets.set("perturbation-map", t);

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

	initialize() {

		const scene = this.scene;
		const assets = this.assets;
		const composer = this.composer;
		const renderer = composer.getRenderer();
		const domElement = renderer.domElement;

		// Epilepsy warning

		if(sessionStorage.getItem("epilepsy-warning") === null) {

			const div = document.createElement("div");
			div.classList.add("warning");
			const p = document.createElement("p");
			p.innerText = "This effect may trigger epileptic seizures or blackouts";
			const a = document.createElement("a");
			a.innerText = "Click here to continue";
			a.href = "Click here to continue";
			a.addEventListener("click", (event) => {

				event.preventDefault();
				sessionStorage.setItem("epilepsy-warning", "1");
				div.remove();

			});

			div.append(p, a);
			document.body.append(div);

		}

		// Camera

		const aspect = window.innerWidth / window.innerHeight;
		const vFoV = calculateVerticalFoV(90, Math.max(aspect, 16 / 9));
		const camera = new PerspectiveCamera(vFoV, aspect, 0.3, 2000);
		this.camera = camera;

		// Controls

		const { position, quaternion } = camera;
		const controls = new SpatialControls(position, quaternion, domElement);
		const settings = controls.settings;
		settings.rotation.setSensitivity(2.2);
		settings.rotation.setDamping(0.05);
		settings.translation.setSensitivity(3.0);
		settings.translation.setDamping(0.1);
		controls.setPosition(-9, 0.5, 0);
		controls.lookAt(0, 3, -3.5);
		this.controls = controls;

		// Sky

		scene.background = new Color(0xeeeeee);

		// Lights

		scene.add(...Sponza.createLights());

		// Objects

		scene.add(assets.get(Sponza.tag));

		// Passes

		const smaaEffect = new SMAAEffect(
			assets.get("smaa-search"),
			assets.get("smaa-area"),
			SMAAPreset.HIGH,
			EdgeDetectionMode.DEPTH
		);

		smaaEffect.edgeDetectionMaterial.setEdgeDetectionThreshold(0.01);

		const chromaticAberrationEffect = new ChromaticAberrationEffect();

		const glitchEffect = new GlitchEffect({
			perturbationMap: assets.get("perturbation-map"),
			chromaticAberrationOffset: chromaticAberrationEffect.offset
		});

		const noiseEffect = new NoiseEffect({
			blendFunction: BlendFunction.COLOR_DODGE
		});

		noiseEffect.blendMode.opacity.value = 0.1;

		const smaaPass = new EffectPass(camera, smaaEffect);
		const glitchPass = new EffectPass(camera, glitchEffect, noiseEffect);
		const chromaticAberrationPass = new EffectPass(camera, chromaticAberrationEffect);

		this.effect = glitchEffect;

		composer.addPass(smaaPass);
		composer.addPass(glitchPass);
		composer.addPass(chromaticAberrationPass);

	}

	registerOptions(menu) {

		const effect = this.effect;
		const perturbationMap = effect.getPerturbationMap();
		const uniforms = effect.uniforms;
		const delay = effect.delay;
		const duration = effect.duration;
		const strength = effect.strength;

		const params = {
			"glitch mode": effect.mode,
			"custom pattern": true,
			"min delay": delay.x,
			"max delay": delay.y,
			"min duration": duration.x,
			"max duration": duration.y,
			"weak glitches": strength.x,
			"strong glitches": strength.y,
			"glitch ratio": effect.ratio,
			"columns": uniforms.get("columns").value
		};

		menu.add(params, "glitch mode", GlitchMode).onChange((value) => {

			effect.mode = Number(value);

		});

		menu.add(params, "custom pattern").onChange((value) => {

			if(value) {

				effect.setPerturbationMap(perturbationMap);

			} else {

				effect.setPerturbationMap(effect.generatePerturbationMap(64));

			}

		});

		menu.add(params, "min delay", 0.0, 2.0, 0.001).onChange((value) => {

			delay.x = value;

		});

		menu.add(params, "max delay", 2.0, 4.0, 0.001).onChange((value) => {

			delay.y = value;

		});

		menu.add(params, "min duration", 0.0, 0.6, 0.001).onChange((value) => {

			duration.x = value;

		});

		menu.add(params, "max duration", 0.6, 1.8, 0.001).onChange((value) => {

			duration.y = value;

		});

		const folder = menu.addFolder("Strength");

		folder.add(params, "weak glitches", 0.0, 1.0, 0.001).onChange((value) => {

			strength.x = value;

		});

		folder.add(params, "strong glitches", 0.0, 1.0, 0.001).onChange((value) => {

			strength.y = value;

		});

		folder.open();

		menu.add(params, "glitch ratio", 0.0, 1.0, 0.001).onChange((value) => {

			effect.ratio = Number.parseFloat(value);

		});

		menu.add(params, "columns", 0.0, 0.5, 0.001).onChange((value) => {

			uniforms.get("columns").value = value;

		});

		if(window.innerWidth < 720) {

			menu.close();

		}

	}

	dispose() {

		const div = document.querySelector(".warning");

		if(div !== null) {

			div.remove();

		}

	}

}
