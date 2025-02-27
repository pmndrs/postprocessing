import { CanvasTexture, RepeatWrapping } from "three";

/**
 * ASCII texture options.
 */

export interface ASCIITextureOptions {

	/*
	 * A string of characters to use for the lookup texture.
	 * @defaultValue " .:,'-^=*+?!|0#X%WM@"
	 */

	characters?: string;

	/**
	 * The font to use.
	 * @defaultValue "Arial"
	 */

	font?: string;

	/**
	 * The font size in pixels.
	 * @defaultValue 54
	 */

	fontSize?: number;

	/**
	 * The size of the texture in pixels.
	 * @defaultValue 1024
	 */

	size?: number;

	/**
	 * The amount of cells along each side of the texture.
	 * @defaultValue 16
	 */

	cellCount?: number;
}

/**
 * An ASCII character lookup texture.
 */

export class ASCIITexture extends CanvasTexture {

	/**
    * The amount of characters in this texture.
    */
	readonly characterCount: number;

	/**
    * The amount of cells along each side of the texture.
    */
	readonly cellCount: number;

	constructor({
		characters = " .:,'-^=*+?!|0#X%WM@",
		font = "Arial",
		fontSize = 35,
		size = 1024,
		cellCount = 16
	}: ASCIITextureOptions = {}) {

		super(
			document.createElement("canvas"),
			undefined,
			RepeatWrapping,
			RepeatWrapping
		);

		this.characterCount = characters.length;
		this.cellCount = cellCount;

		const canvas = this.image as HTMLCanvasElement;
		canvas.width = canvas.height = size;

		const context = canvas.getContext("2d")!;
		const cellSize = size / cellCount;
		context.font = `${fontSize}px ${font}`;
		context.textAlign = "center";
		context.textBaseline = "middle";
		context.fillStyle = "#ffffff";

		for(let i = 0, l = characters.length; i < l; ++i) {

			const char = characters[i];
			const x = i % cellCount;
			const y = Math.floor(i / cellCount);

			context.fillText(char, x * cellSize + cellSize / 2, y * cellSize + cellSize / 2);

		}

	}

}
