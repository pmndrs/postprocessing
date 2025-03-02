import { Color, Uniform, Vector2, Vector4 } from "three";
import { ASCIITexture } from "../textures/ASCIITexture.js";
import { Effect } from "./Effect.js";

import fragmentShader from "./glsl/ascii.frag";

/**
 * An ASCII effect.
 *
 * Warning: This effect cannot be merged with convolution effects.
 */

export class ASCIIEffect extends Effect {

	/**
	 * Constructs a new ASCII effect.
	 *
	 * @param {Object} [options] - The options.
	 * @param {ASCIITexture} [options.asciiTexture] - An ASCII character lookup texture.
	 * @param {Number} [options.cellSize=16] - The cell size. It's recommended to use even numbers.
	 * @param {Number} [options.color=null] - A color to use instead of the scene colors.
	 * @param {Boolean} [options.inverted=false] - Inverts the effect.
	 */

	constructor({
		asciiTexture = new ASCIITexture(),
		cellSize = 16,
		color = null,
		inverted = false
	} = {}) {

		super("ASCIIEffect", fragmentShader, {
			uniforms: new Map([
				["asciiTexture", new Uniform(null)],
				["cellCount", new Uniform(new Vector4())],
				["color", new Uniform(new Color())]
			])
		});

		/**
		 * @see {@link cellSize}
		 * @type {Number}
		 * @private
		 */

		this._cellSize = -1;

		/**
		 * The current resolution.
		 *
		 * @type {Vector2}
		 * @private
		 */

		this.resolution = new Vector2();

		this.asciiTexture = asciiTexture;
		this.cellSize = cellSize;
		this.color = color;
		this.inverted = inverted;

	}

	/**
	 * The current ASCII lookup texture.
	 *
	 * @type {ASCIITexture}
	 */

	get asciiTexture() {

		return this.uniforms.get("asciiTexture").value;

	}

	set asciiTexture(value) {

		const currentTexture = this.uniforms.get("asciiTexture").value;
		this.uniforms.get("asciiTexture").value = value;

		if(currentTexture !== null && currentTexture !== value) {

			currentTexture.dispose();

		}

		if(value !== null) {

			const cellCount = value.cellCount;

			this.defines.set("CHAR_COUNT_MINUS_ONE", (value.characterCount - 1).toFixed(1));
			this.defines.set("TEX_CELL_COUNT", cellCount.toFixed(1));
			this.defines.set("INV_TEX_CELL_COUNT", (1.0 / cellCount).toFixed(9));

			this.setChanged();

		}

	}

	/**
	 * A color that overrides the scene colors.
	 *
	 * @type {Color | String | Number | null}
	 */

	get color() {

		return this.uniforms.get("color").value;

	}

	set color(value) {

		if(value !== null) {

			this.uniforms.get("color").value.set(value);

		}

		if(this.defines.has("USE_COLOR") && value === null) {

			this.defines.delete("USE_COLOR");
			this.setChanged();

		} else if(!this.defines.has("USE_COLOR") && value !== null) {

			this.defines.set("USE_COLOR", "1");
			this.setChanged();

		}

	}

	/**
	 * Controls whether the effect should be inverted.
	 *
	 * @type {Boolean}
	 */

	get inverted() {

		return this.defines.has("INVERTED");

	}

	set inverted(value) {

		if(this.inverted !== value) {

			if(value) {

				this.defines.set("INVERTED", "1");

			} else {

				this.defines.delete("INVERTED");

			}

			this.setChanged();

		}

	}

	/**
	 * The cell size.
	 *
	 * @type {Number}
	 */

	get cellSize() {

		return this._cellSize;

	}

	set cellSize(value) {

		if(this._cellSize !== value) {

			this._cellSize = value;
			this.updateCellCount();

		}

	}

	/**
	 * Updates the cell count uniform.
	 *
	 * @private
	 */

	updateCellCount() {

		const cellCount = this.uniforms.get("cellCount").value;
		const resolution = this.resolution;

		cellCount.x = resolution.width / this.cellSize;
		cellCount.y = resolution.height / this.cellSize;
		cellCount.z = 1.0 / cellCount.x;
		cellCount.w = 1.0 / cellCount.y;

	}

	/**
	 * Updates the size of this pass.
	 *
	 * @param {Number} width - The width.
	 * @param {Number} height - The height.
	 */

	setSize(width, height) {

		this.resolution.set(width, height);
		this.updateCellCount();

	}

	/**
	 * Deletes internal render targets and textures.
	 */

	dispose() {

		if(this.asciiTexture !== null) {

			this.asciiTexture.dispose();

		}

		super.dispose();

	}

}
