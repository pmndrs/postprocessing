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
	 */

	asciiTexture?: ASCIITexture | null;

	/**
	 * The size of a single cell in pixels.
	 *
	 * It's recommended to use even numbers.
	 *
	 * @defaultValue 16
	 */

	cellSize?: number;

	/**
	 * A color that overrides the scene colors.
	 *
	 * @defaultValue null
	 */

	color?: Color | string | number | null;

	/**
	 * Whether the effect should be inverted.
	 *
	 * @defaultValue false
	 */

	inverted?: boolean;

}

/**
 * An ASCII effect.
 *
 * @category Effects
 */

export class ASCIIEffect extends Effect implements ASCIIEffectOptions {

	/**
	 * @see {@link cellSize}
	 */

	private _cellSize: number;

	/**
	 * Constructs a new ASCIIEffect.
	 */

	constructor({
		asciiTexture = new ASCIITexture(),
		cellSize = 16,
		color = null,
		inverted = false
	}: ASCIIEffectOptions = {}) {

		super("ASCIIEffect");

		this.fragmentShader = fragmentShader;

		const uniforms = this.input.uniforms;
		uniforms.set("asciiTexture", new Uniform(null));
		uniforms.set("cellCount", new Uniform(new Vector4()));
		uniforms.set("color", new Uniform(new Color()));

		this._cellSize = -1;

		this.asciiTexture = asciiTexture;
		this.cellSize = cellSize;
		this.color = color;
		this.inverted = inverted;

	}

	get asciiTexture(): ASCIITexture | null {

		return this.input.uniforms.get("asciiTexture")!.value as ASCIITexture;

	}

	set asciiTexture(value: ASCIITexture | null) {

		const currentTexture = this.input.uniforms.get("asciiTexture")!.value as ASCIITexture;
		this.input.uniforms.get("asciiTexture")!.value = value;

		if(currentTexture !== null && currentTexture !== value) {

			currentTexture.dispose();

		}

		if(value !== null) {

			const cellCount = value.cellCount;

			this.input.defines.set("CHAR_COUNT_MINUS_ONE", (value.characterCount - 1).toFixed(1));
			this.input.defines.set("TEX_CELL_COUNT", cellCount.toFixed(1));
			this.input.defines.set("INV_TEX_CELL_COUNT", (1.0 / cellCount).toFixed(9));

			this.setChanged();

		}

	}

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

			this.input.defines.set("USE_COLOR", true);
			this.setChanged();

		}

	}

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

	protected override onResolutionChange(): void {

		this.updateCellCount();

	}

	override dispose(): void {

		super.dispose();
		this.asciiTexture?.dispose();

	}

}
