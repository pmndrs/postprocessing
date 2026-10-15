import { IUniform } from "three";
import { CompositeMap } from "../../utils/CompositeMap.js";
import { Resource } from "./Resource.js";
import { ShaderData } from "./ShaderData.js";

/**
 * A shader data resource.
 *
 * @category IO
 */

export class ShaderDataResource extends Resource<ShaderData> implements ShaderData {

	/**
	 * @see {@link connectedData}
	 */

	private readonly _connectedData: Set<ShaderDataResource>;

	/**
	 * Constructs a new shader data resource.
	 */

	constructor() {

		super({
			defines: new CompositeMap(),
			uniforms: new CompositeMap()
		});

		this._connectedData = new Set();

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
	 * A collection of shader data resources that are currently connected to this resource.
	 */

	get connectedData(): ReadonlySet<ShaderDataResource> {

		return this._connectedData;

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

		if(this._connectedData.has(other)) {

			return;

		}

		this._connectedData.add(other);
		this.defines.connect(other.defines);
		this.uniforms.connect(other.uniforms);

	}

	/**
	 * Removes a shader data resource from this data.
	 *
	 * @param other - The shader data to remove.
	 */

	remove(other: ShaderDataResource): void {

		if(!this._connectedData.has(other)) {

			return;

		}

		this._connectedData.delete(other);
		this.defines.disconnect(other.defines);
		this.uniforms.disconnect(other.uniforms);

	}

}
