import { GlitchMaterial } from "../materials";
import { Pass } from "./pass";
import THREE from "three";

/**
 * A glitch pass.
 *
 * @class GlitchPass
 * @constructor
 * @extends Pass
 * @param {Object} [options] - The options.
 * @param {Texture} [options.perturbMap] - A perturbation map.
 * @param {Number} [options.dtSize=64] - The size of the generated noise map.
 */

export function GlitchPass(options) {

	Pass.call(this);

	if(options === undefined) { options = {}; }
	if(options.dtSize === undefined) { options.dtSize = 64; }

	/**
	 * Glitch shader material.
	 *
	 * @property material
	 * @type GlitchMaterial
	 * @private
	 */

	this.material = new GlitchMaterial();

	/**
	 * A perturbation map.
	 *
	 * If none is provided, a noise texture will be created.
	 * The texture will automatically be destroyed when the 
	 * EffectComposer is deleted.
	 *
	 * @property perturbMap
	 * @type Texture
	 */

	if(options.perturbMap !== undefined) {

		this.perturbMap = options.perturbMap;
		this.perturbMap.generateMipmaps = false;
		this.material.uniforms.tDisp.value = this.perturbMap;

	} else {

		this.perturbMap = null;
		this.generatePerturbMap(options.dtSize);

	}

	/**
	 * Render to screen flag.
	 *
	 * @property renderToScreen
	 * @type Boolean
	 * @default false
	 */

	this.renderToScreen = false;

	/**
	 * The quad mesh to render.
	 *
	 * @property quad
	 * @type Mesh
	 */

	this.goWild = false;

	/**
	 * Counter for glitch activation/deactivation.
	 *
	 * @property curF
	 * @type Number
	 * @private
	 */

	this.curF = 0;

	// Set the material of the rendering quad.
	this.quad.material = this.material;

	// Swap read and write buffer when done.
	this.needsSwap = true;

	// Create a new glitch point.
	this.generateTrigger();

}

GlitchPass.prototype = Object.create(Pass.prototype);
GlitchPass.prototype.constructor = GlitchPass;

/**
 * Renders the scene.
 *
 * @method render
 * @param {WebGLRenderer} renderer - The renderer to use.
 * @param {WebGLRenderTarget} writeBuffer - The write buffer.
 * @param {WebGLRenderTarget} readBuffer - The read buffer.
 */

GlitchPass.prototype.render = function(renderer, writeBuffer, readBuffer) {

	var uniforms = this.material.uniforms;

	uniforms.tDiffuse.value = readBuffer;
	uniforms.seed.value = Math.random();
	uniforms.byp.value = 0;

	if(this.curF % this.randX === 0 || this.goWild) {

		uniforms.amount.value = Math.random() / 30;
		uniforms.angle.value = THREE.Math.randFloat(-Math.PI, Math.PI);
		uniforms.seedX.value = THREE.Math.randFloat(-1, 1);
		uniforms.seedY.value = THREE.Math.randFloat(-1, 1);
		uniforms.distortionX.value = THREE.Math.randFloat(0, 1);
		uniforms.distortionY.value = THREE.Math.randFloat(0, 1);
		this.curF = 0;
		this.generateTrigger();

	} else if(this.curF % this.randX < this.randX / 5) {

		uniforms.amount.value = Math.random() / 90;
		uniforms.angle.value = THREE.Math.randFloat(-Math.PI, Math.PI);
		uniforms.distortionX.value = THREE.Math.randFloat(0, 1);
		uniforms.distortionY.value = THREE.Math.randFloat(0, 1);
		uniforms.seedX.value = THREE.Math.randFloat(-0.3, 0.3);
		uniforms.seedY.value = THREE.Math.randFloat(-0.3, 0.3);

	} else if(!this.goWild) {

		uniforms.byp.value = 1;

	}

	++this.curF;

	if(this.renderToScreen) {

		renderer.render(this.scene, this.camera);

	} else {

		renderer.render(this.scene, this.camera, writeBuffer, false);

	}

};

/**
 * Creates a new break point for the glitch effect.
 *
 * @method generateTrigger
 */

GlitchPass.prototype.generateTrigger = function() {

	this.randX = THREE.Math.randInt(120, 240);

};

/**
 * Destroys the currently set texture, if any, and 
 * generates a simple noise map.
 *
 * @method generatePerturbMap
 * @param {Number} size - The texture size.
 * @private
 */

GlitchPass.prototype.generatePerturbMap = function(size) {

	var i, x;
	var l = size * size;
	var data = new Float32Array(l * 3);

	for(i = 0; i < l; ++i) {

		x = THREE.Math.randFloat(0, 1);

		data[i * 3] = x;
		data[i * 3 + 1] = x;
		data[i * 3 + 2] = x;

	}

	// If there's a texture, delete it.
	if(this.perturbMap !== null) { this.perturbMap.dispose(); }

	this.perturbMap = new THREE.DataTexture(data, size, size, THREE.RGBFormat, THREE.FloatType);
	this.perturbMap.needsUpdate = true;

	this.material.uniforms.tDisp.value = this.perturbMap;

};
