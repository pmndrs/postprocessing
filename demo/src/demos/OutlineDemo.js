import {
	AmbientLight,
	AnimationMixer,
	BoxBufferGeometry,
	CircleBufferGeometry,
	Color,
	CubeTextureLoader,
	ConeBufferGeometry,
	DirectionalLight,
	DoubleSide,
	Mesh,
	MeshPhongMaterial,
	OctahedronBufferGeometry,
	PerspectiveCamera,
	Raycaster,
	SphereBufferGeometry,
	sRGBEncoding,
	TextureLoader,
	Vector2
} from "three";

import { SpatialControls } from "spatial-controls";
import { ProgressManager } from "../utils/ProgressManager";
import { PostProcessingDemo } from "./PostProcessingDemo";

import * as RiggedSimple from "./objects/RiggedSimple";

import {
	BlendFunction,
	EdgeDetectionMode,
	EffectPass,
	OutlineEffect,
	KernelSize,
	SMAAEffect,
	SMAAImageLoader,
	SMAAPreset
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

		/**
		 * An animation mixer.
		 *
		 * @type {AnimationMixer}
		 * @private
		 */

		this.animationMixer = null;

	}

	/**
	 * Raycasts the scene.
	 *
	 * @param {PointerEvent} event - A pointer event.
	 */

	raycast(event) {

		const raycaster = this.raycaster;

		mouse.x = (event.clientX / window.innerWidth) * 2.0 - 1.0;
		mouse.y = -(event.clientY / window.innerHeight) * 2.0 + 1.0;

		raycaster.setFromCamera(mouse, this.camera);
		const intersects = raycaster.intersectObjects(this.scene.children, true);

		this.selectedObject = null;

		if(intersects.length > 0) {

			const object = intersects[0].object;

			if(object !== undefined) {

				this.selectedObject = object;

			}

		}

	}

	/**
	 * Handles the current selection.
	 *
	 * @private
	 */

	handleSelection() {

		const selection = this.effect.selection;
		const selectedObject = this.selectedObject;

		if(selectedObject !== null) {

			if(selection.has(selectedObject)) {

				selection.delete(selectedObject);

			} else {

				selection.add(selectedObject);

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

			case "mousedown":
				this.raycast(event);
				this.handleSelection();
				break;

		}

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

		const path = "textures/skies/sunset/";
		const format = ".png";
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

				textureLoader.load("textures/pattern.png", (t) => {

					assets.set("pattern-color", t);

				});

				RiggedSimple.load(assets, loadingManager);

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
		const camera = new PerspectiveCamera(50, aspect, 1, 2000);
		camera.position.set(-4, 1.25, -5);
		camera.lookAt(scene.position);
		this.camera = camera;

		// Controls

		const controls = new SpatialControls(camera.position, camera.quaternion, renderer.domElement);
		controls.settings.pointer.lock = false;
		controls.settings.translation.enabled = false;
		controls.settings.sensitivity.rotation = 2.2;
		controls.settings.sensitivity.zoom = 1.0;
		controls.lookAt(scene.position);
		this.controls = controls;

		// Sky

		scene.background = assets.get("sky");

		// Lights

		const ambientLight = new AmbientLight(0x212121);
		const mainLight = new DirectionalLight(0xff7e66, 1.0);
		const backLight = new DirectionalLight(0xff7e66, 0.1);

		mainLight.position.set(14.4, 2, 20);
		backLight.position.copy(mainLight.position).negate();

		scene.add(ambientLight, mainLight, backLight);

		// Objects

		const selection = [];
		const meshes = [];

		let mesh = new Mesh(
			new SphereBufferGeometry(1, 32, 32),
			new MeshPhongMaterial({
				color: 0xffff00
			})
		);

		scene.add(mesh);
		meshes.push(mesh);
		selection.push(mesh);

		mesh = new Mesh(
			new OctahedronBufferGeometry(),
			new MeshPhongMaterial({
				color: 0xff00ff
			})
		);

		scene.add(mesh);
		meshes.push(mesh);
		selection.push(mesh);

		mesh = new Mesh(
			new CircleBufferGeometry(0.75, 32),
			new MeshPhongMaterial({
				side: DoubleSide,
				color: 0xff0000
			})
		);

		scene.add(mesh);
		meshes.push(mesh);
		selection.push(mesh);

		mesh = new Mesh(
			new ConeBufferGeometry(1, 1, 32),
			new MeshPhongMaterial({
				color: 0x00ff00
			})
		);

		scene.add(mesh);
		meshes.push(mesh);
		selection.push(mesh);

		mesh = new Mesh(
			new BoxBufferGeometry(1, 1, 1),
			new MeshPhongMaterial({
				color: 0x00ffff
			})
		);

		scene.add(mesh);
		meshes.push(mesh);

		const riggedSimple = assets.get(RiggedSimple.tag);
		const animationMixer = new AnimationMixer(riggedSimple.scene);
		const action = animationMixer.clipAction(riggedSimple.animations[0]);
		this.animationMixer = animationMixer;
		action.play();

		mesh = riggedSimple.scene;

		scene.add(mesh);
		meshes.push(mesh);
		selection.push(mesh.children[0].children[0].children[1]);

		const step = 2.0 * Math.PI / meshes.length;
		const radius = 3.0;

		let angle = 0.4;

		for(mesh of meshes) {

			// Arrange the objects in a circle.
			mesh.position.set(radius * Math.cos(angle), 0, radius * Math.sin(angle));
			angle += step;

		}

		// Raycaster

		this.raycaster = new Raycaster();
		renderer.domElement.addEventListener("mousedown", this);

		// Passes

		const smaaEffect = new SMAAEffect(
			assets.get("smaa-search"),
			assets.get("smaa-area"),
			SMAAPreset.HIGH,
			EdgeDetectionMode.COLOR
		);

		smaaEffect.edgeDetectionMaterial.setEdgeDetectionThreshold(0.05);

		const outlineEffect = new OutlineEffect(scene, camera, {
			blendFunction: BlendFunction.SCREEN,
			edgeStrength: 2.5,
			pulseSpeed: 0.0,
			visibleEdgeColor: 0xffffff,
			hiddenEdgeColor: 0x22090a,
			height: 480,
			blur: false,
			xRay: true
		});

		outlineEffect.selection.set(selection);

		const smaaPass = new EffectPass(camera, smaaEffect);
		const outlinePass = new EffectPass(camera, outlineEffect);

		this.effect = outlineEffect;
		this.pass = outlinePass;

		// The outline effect uses mask textures which produce aliasing artifacts.
		composer.addPass(outlinePass);
		composer.addPass(smaaPass);

	}

	/**
	 * Updates this demo.
	 *
	 * @param {Number} delta - The time since the last frame in seconds.
	 */

	update(delta) {

		this.animationMixer.update(delta);

	}

	/**
	 * Registers configuration options.
	 *
	 * @param {GUI} menu - A menu.
	 */

	registerOptions(menu) {

		const color = new Color();

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
			"visible edge": color.copyLinearToSRGB(uniforms.get("visibleEdgeColor").value).getHex(),
			"hidden edge": color.copyLinearToSRGB(uniforms.get("hiddenEdgeColor").value).getHex(),
			"x-ray": true,
			"opacity": blendMode.opacity.value,
			"blend mode": blendMode.blendFunction
		};

		menu.add(params, "resolution", [240, 360, 480, 720, 1080]).onChange((value) => {

			effect.resolution.height = Number(value);

		});

		menu.add(pass, "dithering");

		menu.add(params, "blurriness").min(KernelSize.VERY_SMALL).max(KernelSize.HUGE + 1).step(1).onChange((value) => {

			effect.blur = (value > 0);
			effect.blurPass.kernelSize = value - 1;

		});

		menu.add(params, "use pattern").onChange((value) => {

			if(value) {

				effect.setPatternTexture(assets.get("pattern-color"));
				uniforms.get("patternScale").value = params["pattern scale"];

			} else {

				effect.setPatternTexture(null);

			}

		});

		menu.add(params, "pattern scale").min(20.0).max(100.0).step(0.1).onChange((value) => {

			if(uniforms.has("patternScale")) {

				uniforms.get("patternScale").value = value;

			}

		});

		menu.add(params, "edge strength").min(0.0).max(10.0).step(0.01).onChange((value) => {

			uniforms.get("edgeStrength").value = value;

		});

		menu.add(params, "pulse speed").min(0.0).max(2.0).step(0.01).onChange((value) => {

			effect.pulseSpeed = value;

		});

		menu.addColor(params, "visible edge").onChange((value) => {

			uniforms.get("visibleEdgeColor").value.setHex(value).convertSRGBToLinear();

		});

		menu.addColor(params, "hidden edge").onChange((value) => {

			uniforms.get("hiddenEdgeColor").value.setHex(value).convertSRGBToLinear();

		});

		menu.add(effect, "xRay");

		menu.add(params, "opacity").min(0.0).max(1.0).step(0.01).onChange((value) => {

			blendMode.opacity.value = value;

		});

		menu.add(params, "blend mode", BlendFunction).onChange((value) => {

			blendMode.setBlendFunction(Number(value));

		});

	}

	/**
	 * Disposes this demo.
	 */

	dispose() {

		const dom = this.composer.getRenderer().domElement;
		dom.removeEventListener("mousedown", this);

	}

}
