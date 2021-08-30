import {
	Color,
	Mesh,
	MeshBasicMaterial,
	PerspectiveCamera,
	SphereBufferGeometry,
	Vector3
} from "three";

import { SpatialControls } from "spatial-controls";
import { calculateVerticalFoV } from "three-demo";
import { ProgressManager } from "../utils/ProgressManager";
import { PostProcessingDemo } from "./PostProcessingDemo";

import * as Sponza from "./objects/Sponza";

import {
	DepthPickingPass,
	EdgeDetectionMode,
	EffectPass,
	ShockWaveEffect,
	SMAAEffect,
	SMAAImageLoader,
	SMAAPreset
} from "../../../src";

/**
 * Normalized device coordinates.
 *
 * @type {Vector3}
 * @private
 */

const ndc = new Vector3();

/**
 * A shock wave demo.
 *
 * @implements {EventListenerObject}
 */

export class ShockWaveDemo extends PostProcessingDemo {

	/**
	 * Constructs a new shock wave demo.
	 *
	 * @param {EffectComposer} composer - An effect composer.
	 */

	constructor(composer) {

		super("shock-wave", composer);

		/**
		 * An effect.
		 *
		 * @type {Effect}
		 * @private
		 */

		this.effect = null;

		/**
		 * A depth picking pass.
		 *
		 * @type {DepthPickingPass}
		 * @private
		 */

		this.depthPickingPass = null;

		/**
		 * A cursor.
		 *
		 * @type {Mesh}
		 * @private
		 */

		this.cursor = null;

	}

	/**
	 * Triggers a shock wave.
	 *
	 * @private
	 */

	explode() {

		this.effect.epicenter.copy(this.cursor.position);
		this.effect.explode();

	}

	/**
	 * Picks depth using the given pointer coordinates.
	 *
	 * @private
	 * @param {PointerEvent} event - An event.
	 */

	async pickDepth(event) {

		ndc.x = (event.clientX / window.innerWidth) * 2.0 - 1.0;
		ndc.y = -(event.clientY / window.innerHeight) * 2.0 + 1.0;

		ndc.z = await this.depthPickingPass.readDepth(ndc);
		ndc.z = ndc.z * 2.0 - 1.0;

		// Convert from NDC to world position.
		this.cursor.position.copy(ndc.unproject(this.camera));

	}

	/**
	 * Handles keyboard events.
	 *
	 * @private
	 * @param {Event} event - An event.
	 */

	handleKeyboardEvent(event) {

		if(event.key === "e") {

			this.explode();

		}

	}

	handleEvent(event) {

		switch(event.type) {

			case "pointermove":
				void this.pickDepth(event);
				break;

			case "keyup":
				this.handleKeyboardEvent(event);
				break;

		}

	}

	load() {

		const assets = this.assets;
		const loadingManager = this.loadingManager;
		const smaaImageLoader = new SMAAImageLoader(loadingManager);

		const anisotropy = Math.min(this.composer.getRenderer()
			.capabilities.getMaxAnisotropy(), 8);

		return new Promise((resolve, reject) => {

			if(assets.size === 0) {

				loadingManager.onLoad = () => setTimeout(resolve, 250);
				loadingManager.onProgress = ProgressManager.updateProgress;
				loadingManager.onError = url => console.error(`Failed to load ${url}`);

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

	initialize() {

		const scene = this.scene;
		const assets = this.assets;
		const composer = this.composer;
		const renderer = composer.getRenderer();
		const domElement = renderer.domElement;

		// Camera

		const aspect = window.innerWidth / window.innerHeight;
		const vFoV = calculateVerticalFoV(90, Math.max(aspect, 16 / 9));
		const camera = new PerspectiveCamera(vFoV, aspect, 0.3, 2000);
		this.camera = camera;

		// Controls

		const target = new Vector3(-0.5, 3, -0.25);
		const { position, quaternion } = camera;
		const controls = new SpatialControls(position, quaternion, domElement);
		const settings = controls.settings;
		settings.rotation.setSensitivity(2.2);
		settings.rotation.setDamping(0.05);
		settings.translation.setSensitivity(3.0);
		settings.translation.setDamping(0.1);
		controls.setPosition(-8, 1, -0.25);
		controls.lookAt(target);
		this.controls = controls;

		// Sky

		scene.background = new Color(0xeeeeee);

		// Lights

		scene.add(...Sponza.createLights());

		// Objects

		scene.add(assets.get(Sponza.tag));

		const mesh = new Mesh(
			new SphereBufferGeometry(0.2, 32, 32),
			new MeshBasicMaterial({
				color: 0x666666,
				transparent: true,
				depthWrite: false,
				opacity: 0.3
			})
		);

		mesh.position.copy(target);
		this.cursor = mesh;
		scene.add(mesh);

		// Passes

		const smaaEffect = new SMAAEffect(
			assets.get("smaa-search"),
			assets.get("smaa-area"),
			SMAAPreset.HIGH,
			EdgeDetectionMode.DEPTH
		);

		smaaEffect.edgeDetectionMaterial.setEdgeDetectionThreshold(0.01);

		const shockWaveEffect = new ShockWaveEffect(camera, target, {
			speed: 1.25,
			maxRadius: 0.5,
			waveSize: 0.2,
			amplitude: 0.05
		});

		const effectPass = new EffectPass(camera, shockWaveEffect);
		const smaaPass = new EffectPass(camera, smaaEffect);
		const depthPickingPass = new DepthPickingPass();

		this.depthPickingPass = depthPickingPass;
		this.effect = shockWaveEffect;

		composer.addPass(depthPickingPass);
		composer.addPass(effectPass);
		composer.addPass(smaaPass);

		// Depth picking

		document.addEventListener("keyup", this);
		renderer.domElement.addEventListener("pointermove", this, {
			passive: true
		});

	}

	registerOptions(menu) {

		const effect = this.effect;
		const uniforms = effect.uniforms;

		const params = {
			"size": uniforms.get("size").value,
			"extent": uniforms.get("maxRadius").value,
			"waveSize": uniforms.get("waveSize").value,
			"amplitude": uniforms.get("amplitude").value,
			"explode (press E)": () => this.explode()
		};

		menu.add(effect, "speed", 0.0, 10.0, 0.001);

		menu.add(params, "size", 0.01, 2.0, 0.001).onChange((value) => {

			uniforms.get("size").value = value;

		});

		menu.add(params, "extent", 0.0, 10.0, 0.001).onChange((value) => {

			uniforms.get("maxRadius").value = value;

		});

		menu.add(params, "waveSize", 0.0, 2.0, 0.001).onChange((value) => {

			uniforms.get("waveSize").value = value;

		});

		menu.add(params, "amplitude", 0.0, 0.25, 0.001).onChange((value) => {

			uniforms.get("amplitude").value = value;

		});

		menu.add(params, "explode (press E)");

		if(window.innerWidth < 720) {

			menu.close();

		}

	}

	dispose() {

		const dom = this.composer.getRenderer().domElement;
		dom.removeEventListener("pointermove", this);
		document.removeEventListener("keyup", this);

	}

}
