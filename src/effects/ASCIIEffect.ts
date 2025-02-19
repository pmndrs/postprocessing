import { Color, Uniform, Vector2, Vector4 } from "three";
import { ASCIITexture } from "../textures/ASCIITexture.js";
import { Effect } from "./Effect.js";

import fragmentShader from "./shaders/ascii.frag";

/**
 * An ASCII effect.
 *
 */

export interface ASCIIEffectOptions {
  asciiTexture?: ASCIITexture;
  cellSize?: number;
  color?: Color | null;
  inverted?: boolean;
}

export class ASCIIEffect extends Effect {
  constructor({
    asciiTexture = new ASCIITexture(),
    cellSize = 16,
    color = null,
    inverted = false,
  }: ASCIIEffectOptions = {}) {
    super("ASCIIEffect");

    this.fragmentShader = fragmentShader;

    const uniforms = this.input.uniforms;
    uniforms.set("asciiTexture", new Uniform(null));
    uniforms.set("color", new Uniform(new Vector4()));
    uniforms.set("cellCount", new Uniform(new Color()));

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

  get asciiTexture(): ASCIITexture {
    return this.input.uniforms.get("asciiTexture").value;
  }

  set asciiTexture(value: ASCIITexture) {
    const currentTexture = this.input.uniforms.get("asciiTexture").value;
    this.input.uniforms.get("asciiTexture").value = value;

    if (currentTexture !== null && currentTexture !== value) {
      currentTexture.dispose();
    }

    if (value !== null) {
      const cellCount = value.cellCount;

      this.input.defines.set("CHAR_COUNT_MINUS_ONE", (value.characterCount - 1).toFixed(1));
      this.input.defines.set("CELL_COUNT", cellCount.toFixed(1));
      this.input.defines.set("INV_CELL_COUNT", (1.0 / cellCount).toFixed(9));

      this.setChanged();
    }
  }

  /**
   * A color that overrides the scene colors.
   *
   * @type {Color | String | Number | null}
   */

  get color() {
    return this.input.uniforms.get("color").value;
  }

  set color(value) {
    if (value !== null) {
      this.input.uniforms.get("color").value.set(value);
    }

    if (this.input.defines.has("USE_COLOR") && value === null) {
      this.input.defines.delete("USE_COLOR");
      this.setChanged();
    } else if (!this.input.defines.has("USE_COLOR") && value !== null) {
      this.input.defines.set("USE_COLOR", "1");
      this.setChanged();
    }
  }

  /**
   * Controls whether the effect should be inverted.
   *
   * @type {Boolean}
   */

  get inverted(): boolean {
    return this.input.defines.has("INVERTED");
  }

  set inverted(value: boolean) {
    if (this.inverted !== value) {
      if (value) {
        this.input.defines.set("INVERTED", "1");
      } else {
        this.input.defines.delete("INVERTED");
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
   */

  private updateCellCount() {
    const cellCount = this.input.uniforms.get("cellCount").value;
    const resolution = this.resolution;

    cellCount.x = resolution.width / this.cellSize;
    cellCount.y = resolution.height / this.cellSize;
    cellCount.z = 1.0 / cellCount.x;
    cellCount.w = 1.0 / cellCount.y;
  }

  /**
   * Updates the size of this pass.
   *
   */

  setSize(width: number, height: number) {
    this.resolution.set(width, height);
    this.updateCellCount();
  }
}
