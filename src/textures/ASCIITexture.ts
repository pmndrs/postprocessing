import { CanvasTexture, RepeatWrapping } from "three";

export interface ASCIITextureOptions {
  characters?: string;
  font?: string;
  fontSize?: number;
  size?: number;
  cellCount?: number;
}

/**
 * An ASCII character lookup texture.
 */

export class ASCIITexture extends CanvasTexture {
  /**
   * Constructs a new ASCII texture.
   *
   * @param {Object} [options] - The options.
   * @param {String} [options.characters] - The character set to render. Defaults to a common ASCII art charset.
   * @param {String} [options.font="Arial"] - The font.
   * @param {Number} [options.fontSize=54] - The font size in pixels.
   * @param {Number} [options.size=1024] - The texture size.
   * @param {Number} [options.cellCount=16] - The cell count along each side of the texture.
   */

  constructor({
    characters = " .:,'-^=*+?!|0#X%WM@",
    font = "Arial",
    fontSize = 54,
    size = 1024,
    cellCount = 16,
  }: ASCIITextureOptions = {}) {
    super(document.createElement("canvas"), undefined, RepeatWrapping, RepeatWrapping);

    const canvas = this.image as HTMLCanvasElement;
    canvas.width = canvas.height = size;

    const context = canvas.getContext("2d") as CanvasRenderingContext2D;
    const cellSize = size / cellCount;
    context.font = `${fontSize}px ${font}`;
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillStyle = "#ffffff";

    for (let i = 0, l = characters.length; i < l; ++i) {
      const char = characters[i];
      const x = i % cellCount;
      const y = Math.floor(i / cellCount);

      context.fillText(char, x * cellSize + cellSize / 2, y * cellSize + cellSize / 2);
    }

    /**
     * The amount of characters in this texture.
     *
     * @type {Number}
     * @readonly
     */

    this.characterCount = characters.length;

    /**
     * The cell count along each side of the texture.
     *
     * @type {Number}
     * @readonly
     */

    this.cellCount = cellCount;
  }
}
