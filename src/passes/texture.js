import { CombineMaterial, CopyMaterial } from "../materials";
import { Pass } from "./pass";
import THREE from "three";

/**
 * A texture pass.
 *
 * This pass doesn't destroy the given texture when it's being disposed.
 *
 * @class TexturePass
 * @constructor
 * @extends Pass
 * @param {Texture} texture - The texture.
 * @param {Number} [opacity] - The opacity to apply to the texture.
 */

export function TexturePass(texture, opacity) {

	Pass.call(this);

	/**
	 * Combine shader material.
	 *
	 * @property combineMaterial
	 * @type CombineMaterial
	 * @private
	 */

	this.combineMaterial = new CombineMaterial();
	this.combineMaterial.uniforms.texture2.value = texture;

	if(opacity !== undefined) { this.combineMaterial.uniforms.opacity2.value = opacity; }

	/**
	 * Copy shader material.
	 *
	 * @property copyMaterial
	 * @type CopyMaterial
	 * @private
	 */

	this.copyMaterial = new CopyMaterial();
	this.copyMaterial.blending = THREE.AdditiveBlending;
	this.copyMaterial.transparent = true;

	this.copyMaterial.uniforms.tDiffuse.value = texture;
	this.copyMaterial.uniforms.opacity.value = (opacity === undefined) ? 1.0 : opacity;

}

TexturePass.prototype = Object.create(Pass.prototype);
TexturePass.prototype.constructor = TexturePass;

/**
 * Renders the scene.
 *
 * @method render
 * @param {WebGLRenderer} renderer - The renderer to use.
 * @param {WebGLRenderTarget} writeBuffer - The write buffer.
 * @param {WebGLRenderTarget} readBuffer - The read buffer.
 * @param {Number} delta - The render delta time.
 */

TexturePass.prototype.render = function(renderer, writeBuffer, readBuffer, delta) {

	if(this.renderToScreen) {

		this.quad.material = this.combineMaterial;
		this.combineMaterial.uniforms.texture1.value = readBuffer;

		renderer.render(this.scene, this.camera);

	} else {

		this.quad.material = this.copyMaterial;

		renderer.render(this.scene, this.camera, readBuffer, false);

	}

};
