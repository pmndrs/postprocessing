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
	RepeatWrapping,
	SphereBufferGeometry,
	TextureLoader,
	Vector2
} from "three";

import { DeltaControls } from "delta-controls";
import { Demo } from "three-demo";
import { KernelSize, OutlinePass } from "../../../src";

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

export class OutlineDemo extends Demo {

	/**
	 * Constructs a new outline demo.
	 */

	constructor() {

		super("outline");

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
		 * An outline pass.
		 *
		 * @type {OutlinePass}
		 * @private
		 */

		this.outlinePass = null;

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

		const pass = this.outlinePass;
		const selection = pass.selection;
		const selectedObject = this.selectedObject;

		if(selectedObject !== null) {

			if(selection.indexOf(selectedObject) >= 0) {

				pass.deselectObject(selectedObject);

			} else {

				pass.selectObject(selectedObject);

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

				textureLoader.load("textures/tripattern.jpg", function(texture) {

					texture.wrapS = texture.wrapT = RepeatWrapping;
					assets.set("pattern-color", texture);

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
		renderer.setClearColor(scene.fog.color);

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
			new BoxBufferGeometry(1, 1, 1),
			new MeshPhongMaterial({
				color: 0x00ffff
			})
		);

		mesh.position.set(-2, 0, -2);
		scene.add(mesh);

		mesh = new Mesh(
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

		// Raycaster.

		this.raycaster = new Raycaster();
		renderer.domElement.addEventListener("mousemove", this);
		renderer.domElement.addEventListener("mousedown", this);

		// Passes.

		const pass = new OutlinePass(scene, camera, {
			edgeStrength: 2.5,
			patternScale: 5.0
		});

		pass.selectObject(mesh);

		this.renderPass.renderToScreen = false;
		pass.renderToScreen = true;
		this.outlinePass = pass;
		composer.addPass(pass);

	}

	/**
	 * Registers configuration options.
	 *
	 * @param {GUI} menu - A menu.
	 */

	registerOptions(menu) {

		const assets = this.assets;
		const composer = this.composer;
		const pass = this.outlinePass;

		const params = {
			"resolution": pass.resolutionScale,
			"kernel size": pass.kernelSize,
			"use pattern": false,
			"pattern scale": pass.outlineBlendMaterial.uniforms.patternScale.value,
			"edge strength": pass.outlineBlendMaterial.uniforms.edgeStrength.value,
			"pulse speed": pass.pulseSpeed,
			"visible edge": pass.visibleEdgeColor.getHex(),
			"hidden edge": pass.hiddenEdgeColor.getHex()
		};

		menu.add(params, "resolution").min(0.0).max(1.0).step(0.01).onChange(function() {

			pass.resolutionScale = params.resolution;
			composer.setSize();

		});

		menu.add(params, "kernel size").min(KernelSize.VERY_SMALL).max(KernelSize.HUGE).step(1).onChange(function() {

			pass.kernelSize = params["kernel size"];

		});

		menu.add(pass, "dithering");

		menu.add(params, "use pattern").onChange(function() {

			pass.setPatternTexture(params["use pattern"] ? assets.get("pattern-color") : null);

		});

		menu.add(params, "pattern scale").min(1.0).max(10.0).step(0.01).onChange(function() {

			pass.outlineBlendMaterial.uniforms.patternScale.value = params["pattern scale"];

		});

		menu.add(params, "edge strength").min(0.0).max(4.0).step(0.01).onChange(function() {

			pass.outlineBlendMaterial.uniforms.edgeStrength.value = params["edge strength"];

		});

		menu.add(params, "pulse speed").min(0.0).max(2.0).step(0.01).onChange(function() {

			pass.pulseSpeed = params["pulse speed"];

		});

		menu.addColor(params, "visible edge").onChange(function() {

			pass.visibleEdgeColor.setHex(params["visible edge"]);

		});

		menu.addColor(params, "hidden edge").onChange(function() {

			pass.hiddenEdgeColor.setHex(params["hidden edge"]);

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
