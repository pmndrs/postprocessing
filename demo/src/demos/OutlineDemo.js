import {
	AmbientLight,
	AnimationMixer,
	BoxGeometry,
	CircleGeometry,
	Color,
	CubeTextureLoader,
	ConeGeometry,
	DirectionalLight,
	DoubleSide,
	Mesh,
	MeshPhongMaterial,
	OctahedronGeometry,
	PerspectiveCamera,
	Raycaster,
	SphereGeometry,
	TextureLoader,
	Vector2,
	SRGBColorSpace
} from "three";

import { ControlMode, SpatialControls } from "spatial-controls";
import { calculateVerticalFoV } from "three-demo";
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
 * Normalized device coordinates.
 *
 * @type {Vector2}
 * @private
 */

const ndc = new Vector2();

/**
 * An outline demo.
 *
 * @implements {EventListenerObject}
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
		 * @type {OutlineEffect}
		 * @private
		 */

		this.effect = null;

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
	 * @param {PointerEvent} event - An event.
	 */

	raycast(event) {

		const raycaster = this.raycaster;

		ndc.x = (event.clientX / window.innerWidth) * 2.0 - 1.0;
		ndc.y = -(event.clientY / window.innerHeight) * 2.0 + 1.0;

		raycaster.setFromCamera(ndc, this.camera);
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

	handleEvent(event) {

		switch(event.type) {

			case "pointerdown":
				this.raycast(event);
				this.handleSelection();
				break;

		}

	}

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
				loadingManager.onError = url => console.error(`Failed to load ${url}`);

				cubeTextureLoader.load(urls, (t) => {

					t.colorSpace = SRGBColorSpace;
					assets.set("sky", t);

				});

				textureLoader.load("textures/pattern.png", (t) => {

					t.colorSpace = SRGBColorSpace;
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
		const domElement = renderer.domElement;

		// Camera

		const aspect = window.innerWidth / window.innerHeight;
		const vFoV = calculateVerticalFoV(90, Math.max(aspect, 16 / 9));
		const camera = new PerspectiveCamera(vFoV, aspect, 0.3, 2000);
		this.camera = camera;

		// Controls

		const { position, quaternion } = camera;
		const controls = new SpatialControls(position, quaternion, domElement);
		const settings = controls.settings;
		settings.general.setMode(ControlMode.THIRD_PERSON);
		settings.rotation.setSensitivity(2.2);
		settings.rotation.setDamping(0.05);
		settings.translation.setEnabled(false);
		settings.zoom.setSensitivity(1.0);
		settings.zoom.setDamping(0.05);
		controls.setPosition(-4, 1.25, -5);
		this.controls = controls;

		// Sky

		scene.background = assets.get("sky");

		// Lights

		const ambientLight = new AmbientLight(0x656565);
		const mainLight = new DirectionalLight(0xffbbaa, 1.0);
		const backLight = new DirectionalLight(0xffbbaa, 0.1);

		mainLight.position.set(14.4, 2, 20);
		backLight.position.copy(mainLight.position).negate();

		scene.add(ambientLight, mainLight, backLight);

		// Objects

		const selection = [];
		const meshes = [];

		let mesh = new Mesh(
			new SphereGeometry(1, 32, 32),
			new MeshPhongMaterial({
				color: 0xffff00
			})
		);

		scene.add(mesh);
		meshes.push(mesh);
		selection.push(mesh);

		mesh = new Mesh(
			new OctahedronGeometry(),
			new MeshPhongMaterial({
				color: 0xff00ff
			})
		);

		scene.add(mesh);
		meshes.push(mesh);
		selection.push(mesh);

		mesh = new Mesh(
			new CircleGeometry(0.75, 32),
			new MeshPhongMaterial({
				side: DoubleSide,
				color: 0xff0000
			})
		);

		mesh.rotation.y = 2.2;
		scene.add(mesh);
		meshes.push(mesh);
		selection.push(mesh);

		mesh = new Mesh(
			new ConeGeometry(1, 1, 32),
			new MeshPhongMaterial({
				color: 0x00ff00
			})
		);

		scene.add(mesh);
		meshes.push(mesh);
		selection.push(mesh);

		mesh = new Mesh(
			new BoxGeometry(1, 1, 1),
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
		renderer.domElement.addEventListener("pointerdown", this);

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

		// The outline effect uses mask textures which produce aliasing artifacts.
		composer.addPass(outlinePass);
		composer.addPass(smaaPass);

	}

	update(deltaTime, timestamp) {

		this.animationMixer.update(deltaTime);

	}

	registerOptions(menu) {

		const color = new Color();

		const assets = this.assets;
		const effect = this.effect;
		const uniforms = effect.uniforms;
		const blendMode = effect.blendMode;

		const params = {
			"resolution": effect.height,
			"blurriness": 0,
			"use pattern": false,
			"pattern scale": 60.0,
			"pulse speed": effect.pulseSpeed,
			"edge strength": effect.edgeStrength,
			"visible edge": color.copyLinearToSRGB(effect.visibleEdgeColor).getHex(),
			"hidden edge": color.copyLinearToSRGB(effect.hiddenEdgeColor).getHex(),
			"x-ray": true,
			"opacity": blendMode.opacity.value,
			"blend mode": blendMode.blendFunction
		};

		menu.add(params, "resolution", [240, 360, 480, 720, 1080]).onChange((value) => {

			effect.resolution.height = Number(value);

		});

		menu.add(params, "blurriness",
			KernelSize.VERY_SMALL, KernelSize.HUGE + 1, 1).onChange((value) => {

			effect.blurPass.enabled = (value > 0);
			effect.blurPass.blurMaterial.kernelSize = value - 1;

		});

		menu.add(params, "use pattern").onChange((value) => {

			if(value) {

				effect.patternTexture = assets.get("pattern-color");
				uniforms.get("patternScale").value = params["pattern scale"];

			} else {

				effect.patternTexture = null;

			}

		});

		menu.add(params, "pattern scale", 20.0, 100.0, 0.1).onChange((value) => {

			uniforms.get("patternScale").value = value;

		});

		menu.add(params, "edge strength", 0.0, 10.0, 0.01).onChange((value) => {

			uniforms.get("edgeStrength").value = value;

		});

		menu.add(params, "pulse speed", 0.0, 2.0, 0.01).onChange((value) => {

			effect.pulseSpeed = value;

		});

		menu.addColor(params, "visible edge").onChange((value) => {

			effect.visibleEdgeColor.setHex(value).convertSRGBToLinear();

		});

		menu.addColor(params, "hidden edge").onChange((value) => {

			effect.hiddenEdgeColor.setHex(value).convertSRGBToLinear();

		});

		menu.add(effect, "xRay");

		menu.add(params, "opacity", 0.0, 1.0, 0.01).onChange((value) => {

			blendMode.opacity.value = value;

		});

		menu.add(params, "blend mode", BlendFunction).onChange((value) => {

			blendMode.setBlendFunction(Number(value));

		});

		if(window.innerWidth < 720) {

			menu.close();

		}

	}

	dispose() {

		const dom = this.composer.getRenderer().domElement;
		dom.removeEventListener("pointerdown", this);

	}

}
