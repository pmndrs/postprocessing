import {
	AmbientLight,
	BoxBufferGeometry,
	CubeTextureLoader,
	ConeBufferGeometry,
	DirectionalLight,
	FogExp2,
	Mesh,
	MeshPhongMaterial,
	OctahedronBufferGeometry,
	PerspectiveCamera,
	Raycaster,
	SphereBufferGeometry,
	TextureLoader,
	Vector2
} from "three";

import { DeltaControls } from "delta-controls";
import { PostProcessingDemo } from "./PostProcessingDemo.js";

import {
	BlendFunction,
	EffectPass,
	OutlineEffect,
	KernelSize,
	SMAAEffect
} from "../../../src";

/**
 * A mouse position.
 *
 * @type {Vector2}
 * @private
 */

const mouse = new Vector2();

/**
 * An outline demo setup.
 *
 * @implements {EventListener}
 */

export class OutlineDemo extends PostProcessingDemo {

	/**
	 * Constructs a new outline demo.
	 *
	 * @param {EffectComposer} composer - An effect composer.
	 */

	constructor(composer) {

		super("outline", composer);

		/**
		 * A raycaster.
		 *
		 * @type {Raycaster}
		 * @private
		 */

		this.raycaster = null;

		/**
		 * A selected object.
		 *
		 * @type {Object3D}
		 * @private
		 */

		this.selectedObject = null;

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

	/**
	 * Raycasts the scene.
	 *
	 * @param {PointerEvent} event - A pointer event.
	 */

	raycast(event) {

		const raycaster = this.raycaster;

		let intersects, x;

		mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
		mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

		raycaster.setFromCamera(mouse, this.camera);
		intersects = raycaster.intersectObjects(this.scene.children);

		if(this.selectedObject !== null) {

			this.selectedObject = null;

		}

		if(intersects.length > 0) {

			x = intersects[0];

			if(x.object !== undefined) {

				this.selectedObject = x.object;

			} else {

				console.warn("Encountered an undefined object", intersects);

			}

		}

	}

	/**
	 * Handles the current selection.
	 *
	 * @private
	 */

	handleSelection() {

		const effect = this.effect;
		const selection = effect.selection;
		const selectedObject = this.selectedObject;

		if(selectedObject !== null) {

			if(selection.indexOf(selectedObject) >= 0) {

				effect.deselectObject(selectedObject);

			} else {

				effect.selectObject(selectedObject);

			}

		}

	}

	/**
	 * Raycasts on mouse move events.
	 *
	 * @param {Event} event - An event.
	 */

	handleEvent(event) {

		switch(event.type) {

			case "mousemove":
				this.raycast(event);
				break;

			case "mousedown":
				this.handleSelection();
				break;

		}

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

				textureLoader.load("textures/pattern.png", function(texture) {

					assets.set("pattern-color", texture);

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
		camera.position.set(-4, 1.25, -5);
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
		renderer.setClearColor(scene.fog.color, 0.0);

		// Sky.

		scene.background = assets.get("sky");

		// Lights.

		const ambientLight = new AmbientLight(0x404040);
		const directionalLight = new DirectionalLight(0xffbbaa);

		directionalLight.position.set(1440, 200, 2000);
		directionalLight.target.position.copy(scene.position);

		scene.add(directionalLight);
		scene.add(ambientLight);

		// Objects.

		let mesh = new Mesh(
			new SphereBufferGeometry(1, 32, 32),
			new MeshPhongMaterial({
				color: 0xffff00
			})
		);

		mesh.position.set(2, 0, -2);
		scene.add(mesh);

		mesh = new Mesh(
			new ConeBufferGeometry(1, 1, 32),
			new MeshPhongMaterial({
				color: 0x00ff00
			})
		);

		mesh.position.set(-2, 0, 2);
		scene.add(mesh);

		mesh = new Mesh(
			new OctahedronBufferGeometry(),
			new MeshPhongMaterial({
				color: 0xff00ff
			})
		);

		mesh.position.set(2, 0, 2);
		scene.add(mesh);

		mesh = new Mesh(
			new BoxBufferGeometry(1, 1, 1),
			new MeshPhongMaterial({
				color: 0x00ffff
			})
		);

		mesh.position.set(-2, 0, -2);
		scene.add(mesh);

		// Raycaster.

		this.raycaster = new Raycaster();
		renderer.domElement.addEventListener("mousemove", this);
		renderer.domElement.addEventListener("mousedown", this);

		// Passes.

		const smaaEffect = new SMAAEffect(assets.get("smaa-search"), assets.get("smaa-area"));
		smaaEffect.colorEdgesMaterial.setEdgeDetectionThreshold(0.05);

		const outlineEffect = new OutlineEffect(scene, camera, {
			blendFunction: BlendFunction.SCREEN,
			edgeStrength: 2.5,
			pulseSpeed: 0.0,
			visibleEdgeColor: 0xffffff,
			hiddenEdgeColor: 0x22090a,
			resolutionScale: 1.0,
			height: 480,
			blur: false,
			xRay: true
		});

		outlineEffect.setSelection(scene.children);
		outlineEffect.deselectObject(mesh);

		const smaaPass = new EffectPass(camera, smaaEffect);
		const outlinePass = new EffectPass(camera, outlineEffect);
		this.renderPass.renderToScreen = false;
		smaaPass.renderToScreen = true;

		this.effect = outlineEffect;
		this.pass = outlinePass;

		// The outline effect uses mask textures which produce aliasing artifacts.
		composer.addPass(outlinePass);
		composer.addPass(smaaPass);

	}

	/**
	 * Registers configuration options.
	 *
	 * @param {GUI} menu - A menu.
	 */

	registerOptions(menu) {

		const assets = this.assets;
		const pass = this.pass;
		const effect = this.effect;
		const uniforms = effect.uniforms;
		const blendMode = effect.blendMode;

		const params = {
			"resolution": effect.height,
			"blurriness": 0,
			"use pattern": false,
			"pattern scale": 60.0,
			"pulse speed": effect.pulseSpeed,
			"edge strength": uniforms.get("edgeStrength").value,
			"visible edge": uniforms.get("visibleEdgeColor").value.getHex(),
			"hidden edge": uniforms.get("hiddenEdgeColor").value.getHex(),
			"x-ray": true,
			"opacity": blendMode.opacity.value,
			"blend mode": blendMode.blendFunction
		};

		menu.add(params, "resolution", [240, 360, 480, 720, 1080]).onChange(() => {

			effect.height = Number.parseInt(params.resolution);

		});

		menu.add(effect, "dithering");

		menu.add(params, "blurriness").min(KernelSize.VERY_SMALL).max(KernelSize.HUGE + 1).step(1).onChange(() => {

			effect.blur = (params.blurriness > 0);
			effect.blurPass.kernelSize = params.blurriness - 1;

		});

		menu.add(params, "use pattern").onChange(() => {

			if(params["use pattern"]) {

				effect.setPatternTexture(assets.get("pattern-color"));
				uniforms.get("patternScale").value = params["pattern scale"];

			} else {

				effect.setPatternTexture(null);

			}

			pass.recompile();

		});

		menu.add(params, "pattern scale").min(20.0).max(100.0).step(0.1).onChange(() => {

			if(uniforms.has("patternScale")) {

				uniforms.get("patternScale").value = params["pattern scale"];

			}

		});

		menu.add(params, "edge strength").min(0.0).max(10.0).step(0.01).onChange(() => {

			uniforms.get("edgeStrength").value = params["edge strength"];

		});

		menu.add(params, "pulse speed").min(0.0).max(2.0).step(0.01).onChange(() => {

			effect.pulseSpeed = params["pulse speed"];

		});

		menu.addColor(params, "visible edge").onChange(() => {

			uniforms.get("visibleEdgeColor").value.setHex(params["visible edge"]);

		});

		menu.addColor(params, "hidden edge").onChange(() => {

			uniforms.get("hiddenEdgeColor").value.setHex(params["hidden edge"]);

		});

		menu.add(effect, "xRay").onChange(() => pass.recompile());

		menu.add(params, "opacity").min(0.0).max(1.0).step(0.01).onChange(() => {

			blendMode.opacity.value = params.opacity;

		});

		menu.add(params, "blend mode", BlendFunction).onChange(() => {

			blendMode.blendFunction = Number.parseInt(params["blend mode"]);
			pass.recompile();

		});

	}

	/**
	 * Resets this demo.
	 *
	 * @return {Demo} This demo.
	 */

	reset() {

		super.reset();

		const dom = this.composer.renderer.domElement;
		dom.removeEventListener("mousemove", this);
		dom.removeEventListener("mousedown", this);

		return this;

	}

}
