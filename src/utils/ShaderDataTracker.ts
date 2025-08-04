import { ShaderMaterial, IUniform } from "three";
import { Disposable } from "../core/Disposable.js";
import { ShaderData } from "../core/ShaderData.js";

/**
 * A shader data tracker.
 *
 * @category Utils
 * @internal
 */

export class ShaderDataTracker implements Disposable, ShaderData {

	readonly defines: Map<string, string | number | boolean>;
	readonly uniforms: Map<string, IUniform>;

	/**
	 * Constructs a new shader data tracker.
	 */

	constructor() {

		this.defines = new Map();
		this.uniforms = new Map();

	}

	/**
	 * Applies shader macros to a given material.
	 *
	 * @see {@link trackDefines} to set macros that should be removed from the material before new ones are added.
	 * @param material - The material that the macros should be assigned to.
	 * @param defines - A collection of preprocessor macro definitions.
	 * @return This helper.
	 */

	applyDefines(material: ShaderMaterial, defines: Map<string, string | number | boolean>): this {

		// Remove tracked defines.
		for(const key of this.defines.keys()) {

			delete material.defines[key];

		}

		// Copy new defines.
		for(const entry of defines.entries()) {

			material.defines[entry[0]] = entry[1];

		}

		material.needsUpdate = true;
		return this;

	}

	/**
	 * Sets shader macros that should be removed from materials before new ones are added.
	 *
	 * @see {@link applyDefines} for adding new macros to a material.
	 * @param defines - A collection of preprocessor macro definitions.
	 * @return This helper.
	 */

	trackDefines(defines: Map<string, string | number | boolean>): this {

		this.defines.clear();

		for(const entry of defines.entries()) {

			this.defines.set(entry[0], entry[1]);

		}

		return this;

	}

	/**
	 * Applies shader uniforms to a given material.
	 *
	 * @see {@link trackUniforms} to set uniforms that should be removed from the material before new ones are added.
	 * @param material - The material that the uniforms should be assigned to.
	 * @param uniforms - A collection of uniforms.
	 * @return This helper.
	 */

	applyUniforms(material: ShaderMaterial, uniforms: Map<string, IUniform>): this {

		// Remove tracked uniforms.
		for(const key of this.uniforms.keys()) {

			delete material.uniforms[key];

		}

		// Copy new uniforms.
		for(const entry of uniforms.entries()) {

			material.uniforms[entry[0]] = entry[1];

		}

		material.uniformsNeedUpdate = true;
		return this;

	}

	/**
	 * Sets shader uniforms that should be removed from materials before new ones are added.
	 *
	 * @see {@link applyUniforms} for adding new uniforms to a material.
	 * @param uniforms - A collection of uniforms.
	 * @return This helper.
	 */

	trackUniforms(uniforms: Map<string, IUniform>): this {

		this.uniforms.clear();

		for(const entry of uniforms.entries()) {

			this.uniforms.set(entry[0], entry[1]);

		}

		return this;

	}

	dispose(): void {

		this.defines.clear();
		this.uniforms.clear();

	}

}
