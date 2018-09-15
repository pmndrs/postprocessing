import { Uniform, Vector2, Vector3 } from "three";
import { Effect } from "./Effect.js";

import fragment from "./glsl/shock-wave/shader.frag";
import vertex from "./glsl/shock-wave/shader.vert";

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
 * A shock wave effect.
 *
 * Based on a Gist by Jean-Philippe Sarda:
 *  https://gist.github.com/jpsarda/33cea67a9f2ecb0a0eda
 *
 * Warning: This effect cannot be merged with antialiasing effects. It is
 * recommended to run this effect last using a stand-alone {@link EffectPass}.
 */

export class ShockWaveEffect extends Effect {

	/**
	 * Constructs a new shock wave effect.
	 *
	 * @param {Camera} camera - The main camera.
	 * @param {Vector3} [epicenter] - The world position of the shock wave epicenter.
	 * @param {Object} [options] - The options.
	 * @param {Number} [options.speed=2.0] - The animation speed.
	 * @param {Number} [options.maxRadius=1.0] - The extent of the shock wave.
	 * @param {Number} [options.waveSize=0.2] - The wave size.
	 * @param {Number} [options.amplitude=0.05] - The distortion amplitude.
	 */

	constructor(camera, epicenter = new Vector3(), options = {}) {

		const settings = Object.assign({
			speed: 2.0,
			maxRadius: 1.0,
			waveSize: 0.2,
			amplitude: 0.05
		}, options);

		super("ShockWaveEffect", fragment, {

			uniforms: new Map([
				["active", new Uniform(false)],
				["center", new Uniform(new Vector2(0.5, 0.5))],
				["cameraDistance", new Uniform(1.0)],
				["size", new Uniform(1.0)],
				["radius", new Uniform(-settings.waveSize)],
				["maxRadius", new Uniform(settings.maxRadius)],
				["waveSize", new Uniform(settings.waveSize)],
				["amplitude", new Uniform(settings.amplitude)]
			]),

			vertexShader: vertex

		});

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
		 * The speed of the shock wave animation.
		 *
		 * @type {Number}
		 */

		this.speed = settings.speed;

		/**
		 * The object position in screen space.
		 *
		 * @type {Vector3}
		 * @private
		 */

		this.screenPosition = new Vector3();

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

	}

	/**
	 * Emits the shock wave.
	 */

	explode() {

		this.time = 0.0;
		this.active = true;

	}

	/**
	 * Updates this effect.
	 *
	 * @param {WebGLRenderer} renderer - The renderer.
	 * @param {WebGLRenderTarget} inputBuffer - A frame buffer that contains the result of the previous pass.
	 * @param {Number} [delta] - The time between the last frame and the current one in seconds.
	 */

	update(renderer, inputBuffer, delta) {

		const epicenter = this.epicenter;
		const mainCamera = this.mainCamera;
		const screenPosition = this.screenPosition;
		const uniforms = this.uniforms;

		if(this.active) {

			const center = uniforms.get("center");
			const radius = uniforms.get("radius");
			const waveSize = uniforms.get("waveSize");

			// Calculate direction vectors.
			mainCamera.getWorldDirection(v);
			ab.copy(mainCamera.position).sub(epicenter);

			// Don't render the effect if the object is behind the camera.
			if(v.angleTo(ab) > HALF_PI) {

				// Scale the effect based on distance to the object.
				uniforms.get("cameraDistance").value = mainCamera.position.distanceTo(epicenter);

				// Calculate the screen position of the epicenter.
				screenPosition.copy(epicenter).project(mainCamera);
				center.value.x = (screenPosition.x + 1.0) * 0.5;
				center.value.y = (screenPosition.y + 1.0) * 0.5;

			}

			// Update the shock wave radius based on time.
			this.time += delta * this.speed;
			radius.value = this.time - waveSize.value;

			this.active = (radius.value < (uniforms.get("maxRadius").value + waveSize.value) * 2);
			uniforms.get("active").value = this.active;

		}

	}

}
