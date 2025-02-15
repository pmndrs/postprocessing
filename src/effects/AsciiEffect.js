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
        invert = false,
        sceneColor = false
    } = {}) {
        const uniforms = new Map([
            ["uCharacters", new Uniform(new Texture())],
            ["uCellSize", new Uniform(cellSize)],
            ["uCharactersCount", new Uniform(characters.length)],
            ["uColor", new Uniform(new Color(color))],
            ["uInvert", new Uniform(invert)],
            ["uUseSceneColor", new Uniform(sceneColor)]
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

    setUseSceneColor(value) {
        this.uniforms.get("uUseSceneColor").value = value;
    }
}
