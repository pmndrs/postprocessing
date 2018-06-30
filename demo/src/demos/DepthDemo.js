import {
	DodecahedronBufferGeometry,
	Mesh,
	MeshBasicMaterial,
	MeshDepthMaterial,
	PerspectiveCamera
} from "three";

import { DeltaControls } from "delta-controls";
import { PostProcessingDemo } from "./PostProcessingDemo.js";

/**
 * A depth texture demo setup.
 */

export class DepthDemo extends PostProcessingDemo {

	/**
	 * Constructs a new depth demo.
	 *
	 * @param {EffectComposer} composer - An effect composer.
	 */

	constructor(composer) {

		super("depth", composer);

		/**
		 * An object.
		 *
		 * @type {Object3D}
		 * @private
		 */

		this.object = null;

	}

	/**
	 * Creates the scene.
	 */

	initialize() {

		const scene = this.scene;
		const composer = this.composer;
		const renderer = composer.renderer;

		// Camera.

		const camera = new PerspectiveCamera(50, window.innerWidth / window.innerHeight, 2, 10);
		camera.position.set(2, 1, 2);
		camera.lookAt(scene.position);
		this.camera = camera;

		// Controls.

		const controls = new DeltaControls(camera.position, camera.quaternion, renderer.domElement);
		controls.settings.pointer.lock = false;
		controls.settings.translation.enabled = false;
		controls.settings.sensitivity.zoom = 0.25;
		controls.settings.zoom.minDistance = 3.0;
		controls.settings.zoom.maxDistance = 9.0;
		controls.lookAt(scene.position);
		this.controls = controls;

		// Fog.

		renderer.setClearColor(0x000000);

		// Objects.

		const mesh = new Mesh(
			new DodecahedronBufferGeometry(1),
			new MeshBasicMaterial()
		);

		this.object = mesh;
		scene.add(mesh);

		// Passes.

		this.renderPass.overrideMaterial = new MeshDepthMaterial();

	}

	/**
	 * Renders this demo.
	 *
	 * @param {Number} delta - The time since the last frame in seconds.
	 */

	render(delta) {

		const object = this.object;
		const twoPI = 2.0 * Math.PI;

		object.rotation.x += 0.001;
		object.rotation.y += 0.005;

		if(object.rotation.x >= twoPI) {

			object.rotation.x -= twoPI;

		}

		if(object.rotation.y >= twoPI) {

			object.rotation.y -= twoPI;

		}

		super.render(delta);

	}

	/**
	 * Registers configuration options.
	 *
	 * @param {GUI} menu - A menu.
	 */

	registerOptions(menu) {

		const pass = this.renderPass;

		menu.add(pass.overrideMaterial, "dithering").onChange(() => {

			pass.overrideMaterial.needsUpdate = true;

		});

	}

}
