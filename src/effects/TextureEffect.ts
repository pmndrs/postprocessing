import { Texture, Uniform, UnsignedByteType } from "three";
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
	 */

	texture?: TextureResource | Texture | null;

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

	private static readonly BUFFER_TEXTURE = "BUFFER_TEXTURE";

	/**
	 * A texture resource.
	 */

	private _texture!: TextureResource;

	/**
	 * A texture `change` event listener.
	 */

	private readonly textureListener: () => void;

	/**
	 * Constructs a new texture effect.
	 *
	 * @param options - The options.
	 */

	constructor({ texture = null }: TextureEffectOptions = {}) {

		super("TextureEffect");

		this.fragmentShader = fragmentShader;

		const defines = this.input.defines;
		defines.set("TEXEL", "texel");

		const uniforms = this.input.uniforms;
		uniforms.set("map", new Uniform(null));
		uniforms.set("uvTransform", new Uniform(null));

		this.textureListener = () => this.onTextureChange();
		this.texture = texture;

	}

	get texture(): Readonly<Texture> | null {

		return this._texture.value;

	}

	set texture(value: TextureResource | Texture | null) {

		this._texture?.removeEventListener("change", this.textureListener);
		this._texture = this.input.setBuffer(TextureEffect.BUFFER_TEXTURE, value);
		this._texture.addEventListener("change", this.textureListener);

		this.onTextureChange();

	}

	/**
	 * Performs configuration tasks when the texture is changed.
	 */

	private onTextureChange(): void {

		const texture = this.texture;
		const uniforms = this.input.uniforms;
		const defines = this.input.defines;

		uniforms.get("map")!.value = texture;
		defines.delete("TEXTURE_PRECISION_HIGH");

		if(texture !== null) {

			if(texture.matrixAutoUpdate) {

				defines.set("UV_TRANSFORM", true);
				uniforms.get("uvTransform")!.value = texture.matrix;
				this.vertexShader = vertexShader;

			} else {

				defines.delete("UV_TRANSFORM");
				uniforms.get("uvTransform")!.value = null;
				this.vertexShader = null;

			}

			if(texture.type !== UnsignedByteType) {

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

		this.input.defines.set("TEXEL", "texel" + swizzle);
		this.setChanged();

	}

	override render(): void {

		if(this.texture !== null && this.texture.matrixAutoUpdate) {

			this.texture.updateMatrix();

		}

	}

}
