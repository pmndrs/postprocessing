import {
    Uniform, Vector2, Vector4,
    CanvasTexture,
    Color,
    NearestFilter,
    RepeatWrapping,
    Texture,
} from "three"
import { Effect } from "./Effect.js";

import fragmentShader from "./glsl/ascii.frag";


// export class AsciiEffect extends Effect {

//     /**
//      * Constructs a new pixelation effect.
//      *
//      * @param {Object} [granularity=30.0] - The pixel granularity.
//      */

//     constructor(granularity = 30.0) {

//         super("AsciiEffect", fragmentShader, {
//             uniforms: new Map([
//                 ["active", new Uniform(false)],
//                 ["d", new Uniform(new Vector4())]
//             ])
//         });

//         /**
//          * The original resolution.
//          *
//          * @type {Vector2}
//          * @private
//          */

//         this.resolution = new Vector2();

//         /**
//          * Backing data for {@link granularity}.
//          *
//          * @type {Number}
//          * @private
//          */

//         this._granularity = 0;
//         this.granularity = granularity;

//     }

//     /**
//      * The pixel granularity.
//      *
//      * A higher value yields coarser visuals.
//      *
//      * @type {Number}
//      */

//     get granularity() {

//         return this._granularity;

//     }

//     set granularity(value) {

//         let d = Math.floor(value);

//         if (d % 2 > 0) {

//             d += 1;

//         }

//         this._granularity = d;
//         this.uniforms.get("active").value = (d > 0);
//         this.setSize(this.resolution.width, this.resolution.height);

//     }

//     /**
//      * Returns the pixel granularity.
//      *
//      * @deprecated Use granularity instead.
//      * @return {Number} The granularity.
//      */

//     getGranularity() {

//         return this.granularity;

//     }

//     /**
//      * Sets the pixel granularity.
//      *
//      * @deprecated Use granularity instead.
//      * @param {Number} value - The new granularity.
//      */

//     setGranularity(value) {

//         this.granularity = value;

//     }

//     /**
//      * Updates the granularity.
//      *
//      * @param {Number} width - The width.
//      * @param {Number} height - The height.
//      */

//     setSize(width, height) {

//         const resolution = this.resolution;
//         resolution.set(width, height);

//         const d = this.granularity;
//         const x = d / resolution.x;
//         const y = d / resolution.y;
//         this.uniforms.get("d").value.set(x, y, 1.0 / x, 1.0 / y);

//     }

// }



/**
 * ASCII effect.
 *
 * Warning: This effect cannot be merged with convolution effects.
 */

export class AsciiEffect extends Effect {
    constructor({
        font = "arial",
        characters = ` .:,'-^=*+?!|0#X%WM@`,
        fontSize = 54,
        cellSize = 16,
        color = "#ffffff",
        invert = false
    } = {}) {
        const uniforms = new Map([
            ["uCharacters", new Uniform(new Texture())],
            ["uCellSize", new Uniform(cellSize)],
            ["uCharactersCount", new Uniform(characters.length)],
            ["uColor", new Uniform(new Color(color))],
            ["uInvert", new Uniform(invert)]
        ])

        super("ASCII", fragmentShader, { uniforms })

        const charactersTextureUniform = this.uniforms.get("uCharacters")

        if (charactersTextureUniform) charactersTextureUniform.value = this.createCharactersTexture(characters, font, fontSize)
    }

    /** Draws the characters on a Canvas and returns a texture */
    createCharactersTexture(characters, font, fontSize) {
        const canvas = document.createElement("canvas")
        const SIZE = 1024
        const MAX_PER_ROW = 16
        const CELL = SIZE / MAX_PER_ROW

        canvas.width = canvas.height = SIZE
        const texture = new CanvasTexture(
            canvas,
            undefined,
            RepeatWrapping,
            RepeatWrapping,
            NearestFilter,
            NearestFilter
        )
        const context = canvas.getContext("2d")

        context.clearRect(0, 0, SIZE, SIZE)
        context.font = `${fontSize}px ${font}`
        context.textAlign = "center"
        context.textBaseline = "middle"
        context.fillStyle = "#fff"

        for (let i = 0; i < characters.length; i++) {
            const char = characters[i]
            const x = i % MAX_PER_ROW
            const y = Math.floor(i / MAX_PER_ROW)
            context.fillText(char, x * CELL + CELL / 2, y * CELL + CELL / 2)
        }

        texture.needsUpdate = true
        return texture
    }
}
