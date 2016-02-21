import THREE from "three";

/**
 * An abstract pass.
 *
 * This class implements a dispose method that frees memory on demand.
 * The EffectComposer calls this method when it is being destroyed.
 *
 * For this mechanism to work properly, please assign your render targets, 
 * materials or textures directly to your pass!
 *
 * You can prevent your disposable objects from being deleted by keeping 
 * them inside deeper structures such as arrays or objects.
 *
 * @class Pass
 * @constructor
 * @param {Scene} [scene] - The scene to render.
 * @param {Camera} [camera] - The camera will be added to the given scene if it has no parent.
 * @param {Mesh} [quad] - A quad that fills the screen. Used for rendering a pure 2D effect. Set this to null, if you don't need it.
 */

export function Pass(scene, camera, quad) {

	/**
	 * The scene to render.
	 *
	 * @property scene
	 * @type Scene
	 * @private
	 * @default Scene()
	 */

	this.scene = (scene !== undefined) ? scene : new THREE.Scene();

	/**
	 * The camera to render with.
	 *
	 * @property camera
	 * @type Camera
	 * @private
	 * @default OrthographicCamera(-1, 1, 1, -1, 0, 1)
	 */

	this.camera = (camera !== undefined) ? camera : new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

	/**
	 * The quad mesh to use for rendering.
	 * Assign your shader material to this mesh!
	 *
	 * @property quad
	 * @type Mesh
	 * @private
	 * @default Mesh(PlaneBufferGeometry(2, 2), null)
	 * @example
	 *  this.quad.material = this.myMaterial;
	 */

	this.quad = (quad !== undefined) ? quad : new THREE.Mesh(new THREE.PlaneBufferGeometry(2, 2), null);

	/**
	 * Enabled flag.
	 *
	 * @property enabled
	 * @type Boolean
	 * @default true
	 */

	this.enabled = true;

	/**
	 * Render to screen flag.
	 *
	 * @property renderToScreen
	 * @type Boolean
	 * @default false
	 */

	this.renderToScreen = false;

	/**
	 * Render target swap flag.
	 *
	 * When set to true, the read and write buffers will be swapped 
	 * after this pass is done with rendering so that any following  
	 * pass can find the rendered result in the read buffer.
	 * Swapping is not necessary if, for example, a pass additively 
	 * renders into the read buffer.
	 *
	 * @property needsSwap
	 * @type Boolean
	 * @default false
	 */

	this.needsSwap = false;

	// Finally, add the camera and the quad to the scene.
	if(this.scene !== null) {

		if(this.camera !== null && this.camera.parent === null) { this.scene.add(this.camera); }
		if(this.quad !== null) { this.scene.add(this.quad);	}

	}

}

/**
 * Renders the scene.
 *
 * This is an abstract method that must be overriden.
 *
 * @method render
 * @throws {Error} An error is thrown if the method is not overridden.
 * @param {WebGLRenderer} renderer - The renderer to use.
 * @param {WebGLRenderTarget} writeBuffer - The write buffer.
 * @param {WebGLRenderTarget} readBuffer - The read buffer.
 * @param {Number} [delta] - The render delta time.
 * @param {Boolean} [maskActive] - Disable stencil test.
 */

Pass.prototype.render = function(renderer, writeBuffer, readBuffer, delta, maskActive) {

	throw new Error("Render method not implemented!");

};

/**
 * Updates this pass with the main render target's size.
 *
 * This is an abstract method that may be overriden in case 
 * you want to be informed about the main render size.
 *
 * The effect composer calls this method when the pass is added 
 * and when the effect composer is reset.
 *
 * @method setSize
 * @param {Number} width - The width.
 * @param {Number} height - The height.
 * @example
 *  this.myRenderTarget.width = width / 2;
 */

Pass.prototype.setSize = function(width, height) {};

/**
 * Performs a shallow search for properties that define a dispose
 * method and deletes them. The pass will be inoperative after 
 * this method was called!
 *
 * Disposable objects:
 *  - render targets
 *  - materials
 *  - textures
 *
 * The EffectComposer calls this method automatically when it is being
 * destroyed. You may, however, use it independently to free memory 
 * when you are certain that you don't need this pass anymore.
 *
 * @method dispose
 */

Pass.prototype.dispose = function() {

	var i, p;
	var keys = Object.keys(this);

	for(i = keys.length - 1; i >= 0; --i) {

		p = this[keys[i]];

		if(p !== null && typeof p.dispose === "function") {

			p.dispose();
			this[keys[i]] = null;

		}

	}

};
