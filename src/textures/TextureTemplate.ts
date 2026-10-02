import { EventDispatcher, TextureParameters } from "three";
import { BaseEventMap } from "../core/BaseEventMap.js";
import { shallowObjectEquals } from "../utils/functions/object.js";

/**
 * A texture template.
 *
 * @category Textures
 */

export class TextureTemplate extends EventDispatcher<BaseEventMap> {

	/**
	 * The name of the texture.
	 */

	readonly name?: string;

	/**
	 * @see {@link values}
	 */

	private readonly _values: TextureParameters;

	/**
	 * Constructs a new texture template.
	 *
	 * @param name - The name of the texture.
	 * @param values - The texture parameters.
	 */

	constructor(name?: string, values?: TextureParameters) {

		super();

		this.name = name;
		this._values = Object.assign({}, values);

	}

	/**
	 * The texture parameters.
	 */

	get values(): Readonly<TextureParameters> {

		return this._values;

	}

	/**
	 * Sets the given texture parameters.
	 *
	 * @remarks Unaffected parameters will be retained.
	 * @param values - The values to apply.
	 */

	setValues(values: TextureParameters): void {

		let changed = false;

		for(const key of Object.keys(values) as (keyof TextureParameters)[]) {

			if(values[key] !== this._values[key]) {

				changed = true;
				break;

			}

		}

		if(changed) {

			Object.assign(this._values, values);
			this.dispatchEvent({ type: "change" });

		}

	}

	/**
	 * Creates a new texture template that equals this one.
	 *
	 * @return The clone.
	 */

	clone(): TextureTemplate {

		return new TextureTemplate(this.name, this.values);

	}

	/**
	 * Compares a given texture template with this one.
	 *
	 * @param other - A texture template.
	 * @return True if the templates are equal.
	 */

	equals(other: TextureTemplate): boolean {

		return this.name === other.name && shallowObjectEquals(this.values, other.values);

	}

}
