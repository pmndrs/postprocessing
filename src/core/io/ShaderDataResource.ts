import { IUniform } from "three";
import { CompositeMap } from "../../utils/CompositeMap.js";
import { ShaderData } from "../../utils/ShaderData.js";
import { Resource } from "./Resource.js";

/**
 * A shader data resource.
 *
 * @category IO
 */

export class ShaderDataResource extends Resource<ShaderData> implements ShaderData {

	/**
	 * Constructs a new shader data resource.
	 */

	constructor() {

		super({
			defines: new CompositeMap(),
			uniforms: new CompositeMap()
		});

		// Propagate change events.
		this.defines.addEventListener("change", () => this.setChanged());
		this.uniforms.addEventListener("change", () => this.setChanged());

	}

	override get value(): ShaderData {

		return super.value;

	}

	get defines(): CompositeMap<string, string | number | boolean> {

		return this.value.defines as CompositeMap<string, string | number | boolean>;

	}

	get uniforms(): CompositeMap<string, IUniform> {

		return this.value.uniforms as CompositeMap<string, IUniform>;

	}

	/**
	 * Adds another shader data resource to this data.
	 *
	 * Defines and uniforms from the connected resource become visible through this resource.
	 * Local defines and uniforms are overridden by connected ones with the same key.
	 *
	 * @param other - The shader data to add.
	 */

	add(other: ShaderDataResource): void {

		this.defines.connect(other.defines);
		this.uniforms.connect(other.uniforms);

	}

	/**
	 * Removes a shader data resource from this data.
	 *
	 * @param other - The shader data to remove.
	 */

	remove(other: ShaderDataResource): void {

		this.defines.disconnect(other.defines);
		this.uniforms.disconnect(other.uniforms);

	}

}
