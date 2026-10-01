import { Texture, Uniform } from "three";
import { isHighPrecision } from "../utils/functions/texture.js";
import { TextureResource } from "../core/io/TextureResource.js";
import { ColorChannel } from "../enums/ColorChannel.js";
import { Effect } from "./Effect.js";

import fragmentShader from "./shaders/texture.frag";
import vertexShader from "./shaders/texture.vert";

/**
 * TextureEffect options.
 *
 * @category Effects
 */

export interface TextureEffectOptions {

	/**
	 * The texture.
	 *
	 * @defaultValue null
	 */

	texture?: TextureResource | Texture | null;

	/**
	 * Enables or disables UV transformation.
	 *
	 * @see {@link Texture.matrix}
	 * @see {@link Texture.matrixAutoUpdate}
	 * @defaultValue true
	 */

	uvTransform?: boolean;

}

/**
 * A texture effect.
 *
 * @category Effects
 */

export class TextureEffect extends Effect implements TextureEffectOptions {

	/**
	 * Identifies the texture buffer.
	 */

	private static readonly BUFFER_TEXTURE = "texture";

	/**
	 * @see {@link texture}
	 */

	private _texture!: TextureResource;

	/**
	 * @see {@link uvTransform}
	 */

	private _uvTransform!: boolean;

	/**
	 * A texture `change` event listener.
	 */

	private readonly textureListener: () => void;

	/**
	 * Constructs a new texture effect.
	 *
	 * @param options - The options.
	 */

	constructor({ texture = null, uvTransform = true }: TextureEffectOptions = {}) {

		super("TextureEffect");

		this.fragmentShader = fragmentShader;

		const defines = this.in.defines;
		defines.set("TEXEL", "texel");

		const uniforms = this.in.uniforms;
		uniforms.set("map", new Uniform(null));
		uniforms.set("uvTransform", new Uniform(null));

		this.textureListener = () => this.onTextureChange();
		this.texture = texture;
		this.uvTransform = uvTransform;

	}

	get texture(): Readonly<Texture> | null {

		return this._texture.value;

	}

	set texture(value: TextureResource | Texture | null) {

		if(this._texture === value) {

			return;

		}

		this._texture?.removeEventListener("change", this.textureListener);
		this._texture = this.in.setBuffer(TextureEffect.BUFFER_TEXTURE, value);
		this._texture.addEventListener("change", this.textureListener);

		this.onTextureChange();

	}

	get uvTransform(): boolean {

		return this._uvTransform;

	}

	set uvTransform(value: boolean) {

		if(this._uvTransform === value) {

			return;

		}

		this._uvTransform = value;

		if(value) {

			this.in.defines.set("UV_TRANSFORM", true);
			this.vertexShader = vertexShader;

		} else {

			this.in.defines.delete("UV_TRANSFORM");
			this.vertexShader = null;

		}

	}

	/**
	 * Performs configuration tasks when the texture is changed.
	 */

	private onTextureChange(): void {

		const texture = this.texture;
		const uniforms = this.in.uniforms;
		const defines = this.in.defines;

		uniforms.get("map")!.value = texture;
		defines.delete("TEXTURE_PRECISION_HIGH");

		if(texture !== null) {

			uniforms.get("uvTransform")!.value = texture.matrix;

			if(isHighPrecision(texture.type)) {

				defines.set("TEXTURE_PRECISION_HIGH", true);

			}

		}

		this.setChanged();

	}

	/**
	 * Sets the swizzles that will be applied to the components of a texel before it is written to the output color.
	 *
	 * @param r - The swizzle for the `r` component.
	 * @param g - The swizzle for the `g` component. Defaults to the same value used for `r`.
	 * @param b - The swizzle for the `b` component. Defaults to the same value used for `r`.
	 * @param a - The swizzle for the `a` component. Defaults to `ColorChannel.ALPHA`.
	 */

	setTextureSwizzleRGBA(r: ColorChannel, g = r, b = r, a = ColorChannel.ALPHA) {

		const rgba = "rgba";
		let swizzle = "";

		if(r !== ColorChannel.RED || g !== ColorChannel.GREEN || b !== ColorChannel.BLUE || a !== ColorChannel.ALPHA) {

			swizzle = [".", rgba[r], rgba[g], rgba[b], rgba[a]].join("");

		}

		this.in.defines.set("TEXEL", "texel" + swizzle);
		this.setChanged();

	}

	override render(): void {

		const texture = this.texture;

		if(this.uvTransform && texture !== null && texture.matrixAutoUpdate) {

			texture.updateMatrix();

		}

	}

}
