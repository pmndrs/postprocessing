import { Uniform, Vector2, Vector3 } from "three";
import { Effect } from "./Effect.js";

import fragmentShader from "./glsl/shock-wave.frag";
import vertexShader from "./glsl/shock-wave.vert";

const HALF_PI = Math.PI * 0.5;
const v = /* @__PURE__ */ new Vector3();
const ab = /* @__PURE__ */ new Vector3();

/**
 * A shock wave effect.
 *
 * Based on a Gist by Jean-Philippe Sarda:
 * https://gist.github.com/jpsarda/33cea67a9f2ecb0a0eda
 */

export class ShockWaveEffect extends Effect {

	/**
	 * Constructs a new shock wave effect.
	 *
	 * @param {Camera} camera - The main camera.
	 * @param {Vector3} [position] - The world position of the shock wave.
	 * @param {Object} [options] - The options.
	 * @param {Number} [options.speed=2.0] - The animation speed.
	 * @param {Number} [options.maxRadius=1.0] - The extent of the shock wave.
	 * @param {Number} [options.waveSize=0.2] - The wave size.
	 * @param {Number} [options.amplitude=0.05] - The distortion amplitude.
	 */

	constructor(camera, position = new Vector3(), {
		speed = 2.0,
		maxRadius = 1.0,
		waveSize = 0.2,
		amplitude = 0.05
	} = {}) {

		super("ShockWaveEffect", fragmentShader, {
			vertexShader,
			uniforms: new Map([
				["active", new Uniform(false)],
				["center", new Uniform(new Vector2(0.5, 0.5))],
				["cameraDistance", new Uniform(1.0)],
				["size", new Uniform(1.0)],
				["radius", new Uniform(-waveSize)],
				["maxRadius", new Uniform(maxRadius)],
				["waveSize", new Uniform(waveSize)],
				["amplitude", new Uniform(amplitude)]
			])
		});

		/**
		 * The position of the shock wave.
		 *
		 * @type {Vector3}
		 */

		this.position = position;

		/**
		 * The speed of the shock wave animation.
		 *
		 * @type {Number}
		 */

		this.speed = speed;

		/**
		 * The main camera.
		 *
		 * @type {Camera}
		 * @private
		 */

		this.camera = camera;

		/**
		 * The object position in screen space.
		 *
		 * @type {Vector3}
		 * @private
		 */

		this.screenPosition = this.uniforms.get("center").value;

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

	set mainCamera(value) {

		this.camera = value;

	}

	/**
	 * The amplitude.
	 *
	 * @type {Number}
	 */

	get amplitude() {

		return this.uniforms.get("amplitude").value;

	}

	set amplitude(value) {

		this.uniforms.get("amplitude").value = value;

	}

	/**
	 * The wave size.
	 *
	 * @type {Number}
	 */

	get waveSize() {

		return this.uniforms.get("waveSize").value;

	}

	set waveSize(value) {

		this.uniforms.get("waveSize").value = value;

	}

	/**
	 * The maximum radius.
	 *
	 * @type {Number}
	 */

	get maxRadius() {

		return this.uniforms.get("maxRadius").value;

	}

	set maxRadius(value) {

		this.uniforms.get("maxRadius").value = value;

	}

	/**
	 * The position of the shock wave.
	 *
	 * @type {Vector3}
	 * @deprecated Use position instead.
	 */

	get epicenter() {

		return this.position;

	}

	set epicenter(value) {

		this.position = value;

	}

	/**
	 * Returns the position of the shock wave.
	 *
	 * @deprecated Use position instead.
	 * @return {Vector3} The position.
	 */

	getPosition() {

		return this.position;

	}

	/**
	 * Sets the position of the shock wave.
	 *
	 * @deprecated Use position instead.
	 * @param {Vector3} value - The position.
	 */

	setPosition(value) {

		this.position = value;

	}

	/**
	 * Returns the speed of the shock wave.
	 *
	 * @deprecated Use speed instead.
	 * @return {Number} The speed.
	 */

	getSpeed() {

		return this.speed;

	}

	/**
	 * Sets the speed of the shock wave.
	 *
	 * @deprecated Use speed instead.
	 * @param {Number} value - The speed.
	 */

	setSpeed(value) {

		this.speed = value;

	}

	/**
	 * Emits the shock wave.
	 */

	explode() {

		this.time = 0.0;
		this.active = true;
		this.uniforms.get("active").value = true;

	}

	/**
	 * Updates this effect.
	 *
	 * @param {WebGLRenderer} renderer - The renderer.
	 * @param {WebGLRenderTarget} inputBuffer - A frame buffer that contains the result of the previous pass.
	 * @param {Number} [delta] - The time between the last frame and the current one in seconds.
	 */

	update(renderer, inputBuffer, delta) {

		const position = this.position;
		const camera = this.camera;
		const uniforms = this.uniforms;
		const uActive = uniforms.get("active");

		if(this.active) {

			const waveSize = uniforms.get("waveSize").value;

			// Calculate direction vectors.
			camera.getWorldDirection(v);
			ab.copy(camera.position).sub(position);

			// Don't render the effect if the object is behind the camera.
			uActive.value = (v.angleTo(ab) > HALF_PI);

			if(uActive.value) {

				// Scale the effect based on distance to the object.
				uniforms.get("cameraDistance").value = camera.position.distanceTo(position);

				// Calculate the screen position of the shock wave.
				v.copy(position).project(camera);
				this.screenPosition.set((v.x + 1.0) * 0.5, (v.y + 1.0) * 0.5);

			}

			// Update the shock wave radius based on time.
			this.time += delta * this.speed;
			const radius = this.time - waveSize;
			uniforms.get("radius").value = radius;

			if(radius >= (uniforms.get("maxRadius").value + waveSize) * 2.0) {

				this.active = false;
				uActive.value = false;

			}

		}

	}

}
