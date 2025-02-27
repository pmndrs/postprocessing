import { Color, Uniform, Vector4 } from "three";
import { ASCIITexture } from "../textures/ASCIITexture.js";
import { Effect } from "./Effect.js";

import fragmentShader from "./shaders/ascii.frag";

/**
 * ASCIIEffect options.
 *
 * @category Effects
 */

export interface ASCIIEffectOptions {

	/**
	 * An ASCII lookup texture.
	 *
	 * @defaultValue ASCIITexture
	 */

	asciiTexture?: ASCIITexture;

	/**
	 * The size of a single cell in pixels.
	 * @defaultValue 16
	 */

	cellSize?: number;

	/**
	 * A color that overrides the scene colors.
	 * @defaultValue new Color(1.0, 1.0, 1.0)
	 */

	color?: Color | string | number | null;

	/**
	 * Whether the effect should be inverted.
	 * @defaultValue false
	 */
	inverted?: boolean;
}

/**
 * An ASCII effect.
 *
 * @category Effects
 */

export class ASCIIEffect extends Effect {

	/**
    * @see {@link cellSize}
    */

	private _cellSize!: number;

	constructor({
		asciiTexture = new ASCIITexture(),
		cellSize = 16,
		color = new Color(1.0, 1.0, 1.0),
		inverted = false
	}: ASCIIEffectOptions = {}) {

		super("ASCIIEffect");

		this.fragmentShader = fragmentShader;

		const uniforms = this.input.uniforms;
		uniforms.set("asciiTexture", new Uniform(null));
		uniforms.set("cellCount", new Uniform(new Vector4()));
		uniforms.set("color", new Uniform(new Color()));


		this.asciiTexture = asciiTexture;
		this.cellSize = cellSize;
		this.color = color;
		this.inverted = inverted;

	}

	/**
   	* The current ASCII lookup texture.
   	*/

	get asciiTexture(): ASCIITexture {

		return this.input.uniforms.get("asciiTexture")!.value as ASCIITexture;

	}

	set asciiTexture(value: ASCIITexture) {

		const currentTexture = this.input.uniforms.get("asciiTexture")!.value as ASCIITexture;
		this.input.uniforms.get("asciiTexture")!.value = value;

		if(currentTexture !== null && currentTexture !== value) {

			currentTexture.dispose();

		}

		if(value !== null) {

			const cellCount = value.cellCount;

			this.input.defines.set("CHAR_COUNT_MINUS_ONE", (value.characterCount - 1).toFixed(1));
			this.input.defines.set("CELL_COUNT", cellCount.toFixed(1));
			this.input.defines.set("INV_CELL_COUNT", (1.0 / cellCount).toFixed(9));

			this.setChanged();

		}

	}

	/**
   * A color that overrides the scene colors.
   */

	get color(): Color {

		return this.input.uniforms.get("color")!.value as Color;

	}

	set color(value: Color | string | number | null) {

		if(value !== null) {

			const color = this.input.uniforms.get("color")!.value as Color;
			color.set(value);

		}

		if(this.input.defines.has("USE_COLOR") && value === null) {

			this.input.defines.delete("USE_COLOR");
			this.setChanged();

		} else if(!this.input.defines.has("USE_COLOR") && value !== null) {

			this.input.defines.set("USE_COLOR", "1");
			this.setChanged();

		}

	}

	/**
   * Controls whether the effect should be inverted.
   */

	get inverted(): boolean {

		return this.input.defines.has("INVERTED");

	}

	set inverted(value: boolean) {

		if(this.inverted !== value) {

			if(value) {

				this.input.defines.set("INVERTED", true);

			} else {

				this.input.defines.delete("INVERTED");

			}

			this.setChanged();

		}

	}

	/**
   	* The cell size.
   	*/

	get cellSize(): number {

		return this._cellSize;

	}

	set cellSize(value: number) {

		if(this._cellSize !== value) {

			this._cellSize = value;
			this.updateCellCount();

		}

	}

	/**
   	* Updates the cell count uniform.
   	*/

	private updateCellCount(): void {

		const cellCount = this.input.uniforms.get("cellCount")!.value as Vector4;
		const resolution = this.resolution;

		cellCount.x = resolution.width / this.cellSize;
		cellCount.y = resolution.height / this.cellSize;
		cellCount.z = 1.0 / cellCount.x;
		cellCount.w = 1.0 / cellCount.y;

	}

	/**
   	* Updates the size of this pass.
   	*/

	protected override onResolutionChange(): void {

		this.updateCellCount();

	}

}
