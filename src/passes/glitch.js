import { GlitchMaterial } from "../materials";
import { Pass } from "./pass";
import THREE from "three";

/**
 * A glitch pass.
 *
 * @class GlitchPass
 * @constructor
 * @extends Pass
 * @param {Number} [dtSize=64] - The size of the generated displacement map.
 */

export function GlitchPass(dtSize) {

	Pass.call(this);

	if(dtSize === undefined) { dtSize = 64; }

	/**
	 * Glitch shader material.
	 *
	 * @property material
	 * @type GlitchMaterial
	 * @private
	 */

	this.material = new GlitchMaterial();
	this.generateHeightmap(dtSize);

	/**
	 * Render to screen flag.
	 *
	 * @property renderToScreen
	 * @type Boolean
	 * @default false
	 */

	this.renderToScreen = false;

	// Swap in this pass.
	this.needsSwap = true;

	/**
	 * The quad mesh to use for rendering the 2D effect.
	 *
	 * @property quad
	 * @type Mesh
	 * @private
	 */

	this.quad = new THREE.Mesh(new THREE.PlaneBufferGeometry(2, 2), this.material);
	this.scene.add(this.quad);

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
		uniforms.angle.value = THREE.Math.randFloat(- Math.PI, Math.PI);
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
 * Generates a randomised displacementmap for this pass.
 *
 * @method generateHeightmap
 * @param {Number} size - The texture size.
 */

GlitchPass.prototype.generateHeightmap = function(size) {

	var length = size * size;
	var data = new Float32Array(length * 3);
	var i, val, t;

	for(i = 0; i < length; ++i) {

		val = THREE.Math.randFloat(0, 1);
		data[i * 3] = val;
		data[i * 3 + 1] = val;
		data[i * 3 + 2] = val;

	}

	t = new THREE.DataTexture(data, size, size, THREE.RGBFormat, THREE.FloatType);
	t.needsUpdate = true;

	this.material.uniforms.tDisp.value = t;

};
