import { Vector3 } from "three";
import { CopyMaterial, ShockWaveMaterial } from "../materials";
import { Pass } from "./Pass.js";

/**
 * Half PI.
 *
 * @type {Number}
 * @private
 */

const HALF_PI = Math.PI * 0.5;

/**
 * A vector.
 *
 * @type {Vector3}
 * @private
 */

const v = new Vector3();

/**
 * A vector.
 *
 * @type {Vector3}
 * @private
 */

const ab = new Vector3();

/**
 * A shock wave pass.
 */

export class ShockWavePass extends Pass {

	/**
	 * Constructs a new shock wave pass.
	 *
	 * @param {Camera} camera - The main camera.
	 * @param {Vector3} [epicenter] - The world position of the shock wave epicenter.
	 * @param {Object} [options] - The options.
	 * @param {Number} [options.speed=1.0] - The animation speed.
	 * @param {Number} [options.maxRadius=1.0] - The extent of the shock wave.
	 * @param {Number} [options.waveSize=0.2] - The wave size.
	 * @param {Number} [options.amplitude=0.05] - The distortion amplitude.
	 */

	constructor(camera, epicenter = new Vector3(), options = {}) {

		super("ShockWavePass");

		/**
		 * The main camera.
		 *
		 * @type {Object3D}
		 */

		this.mainCamera = camera;

		/**
		 * The epicenter.
		 *
		 * @type {Vector3}
		 * @example shockWavePass.epicenter = myMesh.position;
		 */

		this.epicenter = epicenter;

		/**
		 * The object position in screen space.
		 *
		 * @type {Vector3}
		 * @private
		 */

		this.screenPosition = new Vector3();

		/**
		 * The speed of the shock wave animation.
		 *
		 * @type {Number}
		 */

		this.speed = (options.speed !== undefined) ? options.speed : 2.0;

		/**
		 * A time accumulator.
		 *
		 * @type {Number}
		 * @private
		 */

		this.time = 0.0;

		/**
		 * Indicates whether the shock wave animation is active.
		 *
		 * @type {Boolean}
		 * @private
		 */

		this.active = false;

		/**
		 * A shock wave shader material.
		 *
		 * @type {ShockWaveMaterial}
		 * @private
		 */

		this.shockWaveMaterial = new ShockWaveMaterial(options);

		this.shockWaveMaterial.uniforms.center.value = this.screenPosition;

		/**
		 * A copy shader material.
		 *
		 * @type {CopyMaterial}
		 * @private
		 */

		this.copyMaterial = new CopyMaterial();

	}

	/**
	 * Emits the shock wave.
	 */

	explode() {

		this.time = 0.0;
		this.active = true;

	}

	/**
	 * Renders the effect.
	 *
	 * @param {WebGLRenderer} renderer - The renderer.
	 * @param {WebGLRenderTarget} readBuffer - The read buffer.
	 * @param {WebGLRenderTarget} writeBuffer - The write buffer.
	 * @param {Number} delta - The render delta time.
	 */

	render(renderer, readBuffer, writeBuffer, delta) {

		const epicenter = this.epicenter;
		const mainCamera = this.mainCamera;
		const screenPosition = this.screenPosition;

		const shockWaveMaterial = this.shockWaveMaterial;
		const uniforms = shockWaveMaterial.uniforms;
		const center = uniforms.center;
		const radius = uniforms.radius;
		const maxRadius = uniforms.maxRadius;
		const waveSize = uniforms.waveSize;

		this.copyMaterial.uniforms.tDiffuse.value = readBuffer.texture;
		this.quad.material = this.copyMaterial;

		if(this.active) {

			// Calculate direction vectors.
			mainCamera.getWorldDirection(v);
			ab.copy(mainCamera.position).sub(epicenter);

			// Don't render the effect if the object is behind the camera.
			if(v.angleTo(ab) > HALF_PI) {

				// Scale the effect based on distance to the object.
				uniforms.cameraDistance.value = mainCamera.position.distanceTo(epicenter);

				// Calculate the screen position of the epicenter.
				screenPosition.copy(epicenter).project(mainCamera);
				center.value.x = (screenPosition.x + 1.0) * 0.5;
				center.value.y = (screenPosition.y + 1.0) * 0.5;

				uniforms.tDiffuse.value = readBuffer.texture;
				this.quad.material = shockWaveMaterial;

			}

			// Update the shock wave radius based on time.
			this.time += delta * this.speed;
			radius.value = this.time - waveSize.value;

			if(radius.value >= (maxRadius.value + waveSize.value) * 2) {

				this.active = false;

			}

		}

		renderer.render(this.scene, this.camera, this.renderToScreen ? null : writeBuffer);

	}

	/**
	 * Updates this pass with the renderer's size.
	 *
	 * @param {Number} width - The width.
	 * @param {Number} height - The height.
	 */

	setSize(width, height) {

		this.shockWaveMaterial.uniforms.aspect.value = width / height;

	}

}
