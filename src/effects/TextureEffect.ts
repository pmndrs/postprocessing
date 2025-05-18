import { Texture, Uniform, UnsignedByteType } from "three";
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

	texture?: Texture | null;

}

/**
 * A texture effect.
 *
 * @category Effects
 */

export class TextureEffect extends Effect implements TextureEffectOptions {

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

		this.texture = texture;

	}

	get texture(): Texture | null {

		return this.input.uniforms.get("map")!.value as Texture;

	}

	set texture(value: Texture | null) {

		const prevTexture = this.texture;
		const uniforms = this.input.uniforms;
		const defines = this.input.defines;

		if(prevTexture !== value) {

			uniforms.get("map")!.value = value;
			defines.delete("TEXTURE_PRECISION_HIGH");

			if(value !== null) {

				if(value.matrixAutoUpdate) {

					defines.set("UV_TRANSFORM", true);
					uniforms.get("uvTransform")!.value = value.matrix;
					this.vertexShader = vertexShader;

				} else {

					defines.delete("UV_TRANSFORM");
					uniforms.get("uvTransform")!.value = null;
					this.vertexShader = null;

				}

				if(value.type !== UnsignedByteType) {

					defines.set("TEXTURE_PRECISION_HIGH", true);

				}

			}

			this.setChanged();

		}

	}

	/**
	 * Sets the swizzles that will be applied to the components of a texel before it is written to the output color.
	 *
	 * @param r - The swizzle for the `r` component.
	 * @param g - The swizzle for the `g` component. Defaults to the same value used for `r`.
	 * @param b - The swizzle for the `b` component. Defaults to the same value used for `r`.
	 * @param a - The swizzle for the `a` component. Defaults to the same value used for `r`.
	 */

	setTextureSwizzleRGBA(r: ColorChannel, g = r, b = r, a = r) {

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
