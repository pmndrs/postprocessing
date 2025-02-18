import { Color, Uniform, Vector2, Vector4 } from "three";
import { ASCIITexture } from "../textures/ASCIITexture.js";
import { Effect } from "./Effect.js";

import fragmentShader from "./glsl/ascii.frag";

export interface ASCIIEffectOptions {
  asciiTexture?: ASCIITexture;
  cellSize?: number;
  color?: number | Color;
  inverted?: boolean;
}

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

  constructor({ asciiTexture = new ASCIITexture(), cellSize = 16, color, inverted = false }: ASCIIEffectOptions = {}) {
    super("ASCIIEffect", fragmentShader, {
      uniforms: new Map<string, Uniform>([
        ["asciiTexture", new Uniform(null)],
        ["cellCount", new Uniform(new Vector4())],
        ["color", new Uniform(new Color())],
      ]),
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
    this.color = color ?? null;
    this.inverted = inverted;
  }

  /**
   * The current ASCII lookup texture.
   *
   * @type {ASCIITexture}
   */

  get asciiTexture(): ASCIITexture {
    return this.uniforms.get("asciiTexture")!.value as ASCIITexture;
  }

  set asciiTexture(value: ASCIITexture) {
    const currentTexture = this.uniforms.get("asciiTexture")!.value as ASCIITexture;
    this.uniforms.get("asciiTexture")!.value = value;

    if (currentTexture !== null && currentTexture !== value) {
      currentTexture.dispose();
    }

    if (value !== null) {
      const cellCount = value.cellCount;
      this.defines.set("CHAR_COUNT_MINUS_ONE", (value.characterCount - 1).toFixed(1));
      this.defines.set("CELL_COUNT", cellCount.toFixed(1));
      this.defines.set("INV_CELL_COUNT", (1.0 / cellCount).toFixed(9));
      this.setChanged();
    }
  }

  /**
   * A color that overrides the scene colors.
   *
   * @type {Color | String | Number | null}
   */

  get color(): Color | null {
    return this.uniforms.get("color")!.value as Color;
  }

  set color(value: Color | number | null) {
    if (value !== null) {
      this.uniforms.get("color")!.value.set(value);
    }

    if (this.defines.has("USE_COLOR") && value === null) {
      this.defines.delete("USE_COLOR");
      this.setChanged();
    } else if (!this.defines.has("USE_COLOR") && value !== null) {
      this.defines.set("USE_COLOR", "1");
      this.setChanged();
    }
  }

  /**
   * Controls whether the effect should be inverted.
   *
   * @type {Boolean}
   */

  get inverted(): boolean {
    return this.defines.has("INVERTED");
  }

  set inverted(value: boolean) {
    if (this.inverted !== value) {
      if (value) {
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

  get cellSize(): number {
    return this._cellSize;
  }

  set cellSize(value: number) {
    if (this._cellSize !== value) {
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
    const cellCount = this.uniforms.get("cellCount")!.value as Vector4;
    const resolution = this.resolution;

    cellCount.x = resolution.x / this.cellSize;
    cellCount.y = resolution.y / this.cellSize;
    cellCount.z = 1.0 / cellCount.x;
    cellCount.w = 1.0 / cellCount.y;
  }

  /**
   * Updates the size of this pass.
   *
   * @param {Number} width - The width.
   * @param {Number} height - The height.
   */

  setSize(width: number, height: number) {
    this.resolution.set(width, height);
    this.updateCellCount();
  }
}
