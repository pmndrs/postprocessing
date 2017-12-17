import {
	DodecahedronBufferGeometry,
	Mesh,
	MeshBasicMaterial,
	MeshDepthMaterial,
	OrbitControls,
	PerspectiveCamera
} from "three";

import { Demo } from "three-demo";

/**
 * A depth texture demo setup.
 */

export class DepthDemo extends Demo {

	/**
	 * Constructs a new depth demo.
	 */

	constructor() {

		super("depth");

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

		const controls = new OrbitControls(camera, renderer.domElement);
		controls.enablePan = false;
		controls.minDistance = 3;
		controls.maxDistance = 9;
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
	 * Updates this demo.
	 *
	 * @param {Number} delta - The time since the last frame in seconds.
	 */

	update(delta) {

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

	}

	/**
	 * Registers configuration options.
	 *
	 * @param {GUI} menu - A menu.
	 */

	registerOptions(menu) {

		const pass = this.renderPass;

		menu.add(pass.overrideMaterial, "dithering").onChange(function() {

			pass.overrideMaterial.needsUpdate = true;

		});

	}

}
