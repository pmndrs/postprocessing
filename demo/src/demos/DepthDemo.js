import {
	DodecahedronBufferGeometry,
	Mesh,
	MeshBasicMaterial,
	MeshDepthMaterial,
	OrbitControls
} from "three";

import { RenderPass } from "../../../src";
import { Demo } from "./Demo.js";

/**
 * PI times two.
 *
 * @type {Number}
 * @private
 */

const TWO_PI = 2.0 * Math.PI;

/**
 * A depth texture demo setup.
 */

export class DepthDemo extends Demo {

	/**
	 * Constructs a new depth demo.
	 *
	 * @param {EffectComposer} composer - An effect composer.
	 */

	constructor(composer) {

		super(composer);

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

	initialise() {

		const scene = this.scene;
		const camera = this.camera;
		const composer = this.composer;

		// Controls.

		this.controls = new OrbitControls(camera, composer.renderer.domElement);
		this.controls.enablePan = false;
		this.controls.minDistance = 3;
		this.controls.maxDistance = 9;

		// Camera.

		camera.near = 2;
		camera.far = 10;
		camera.updateProjectionMatrix();
		camera.position.set(2, 1, 2);
		camera.lookAt(this.controls.target);

		// Objects.

		const mesh = new Mesh(
			new DodecahedronBufferGeometry(1),
			new MeshBasicMaterial()
		);

		this.object = mesh;
		scene.add(mesh);

		// Passes.

		composer.addPass(new RenderPass(scene, camera));

		const pass = new RenderPass(scene, camera, {
			overrideMaterial: new MeshDepthMaterial()
		});

		pass.renderToScreen = true;
		composer.addPass(pass);

	}

	/**
	 * Updates this demo.
	 *
	 * @param {Number} delta - The time since the last frame in seconds.
	 */

	update(delta) {

		const object = this.object;

		if(object !== null) {

			object.rotation.x += 0.001;
			object.rotation.y += 0.005;

			// Prevent overflow.
			if(object.rotation.x >= TWO_PI) { object.rotation.x -= TWO_PI; }
			if(object.rotation.y >= TWO_PI) { object.rotation.y -= TWO_PI; }

		}

	}

}
