import { IUniform } from "three";
import { CompositeMap } from "../../utils/CompositeMap.js";
import { ShaderData } from "../../utils/ShaderData.js";
import { Connectable } from "../Connectable.js";
import { Resource } from "./Resource.js";

/**
 * A shader data resource.
 *
 * @category IO
 */

export class ShaderDataResource extends Resource<ShaderData> implements Connectable, ShaderData {

	/**
	 * Constructs a new shader data resource.
	 */

	constructor() {

		super({
			defines: new CompositeMap(),
			uniforms: new CompositeMap()
		});

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
	 * Connects another shader data resource as an inherited source.
	 *
	 * Defines and uniforms from the connected resource become visible through this
	 * resource. Local defines and uniforms override connected ones with the same key.
	 *
	 * @param other - The shader data to inherit entries from.
	 */

	connect(other: ShaderDataResource): void {

		this.defines.connect(other.defines);
		this.uniforms.connect(other.uniforms);

	}

	disconnect(other: ShaderDataResource): void {

		this.defines.disconnect(other.defines);
		this.uniforms.disconnect(other.uniforms);

	}

}
