import {
	AmbientLight,
	CubeTextureLoader,
	DirectionalLight,
	Mesh,
	MeshPhongMaterial,
	OrbitControls,
	CylinderBufferGeometry
} from "three";

import { BokehPass, RenderPass } from "../../../src";
import { Demo } from "./Demo.js";

/**
 * A bokeh demo setup.
 */

export class BokehDemo extends Demo {

	/**
	 * Constructs a new bokeh demo.
	 *
	 * @param {EffectComposer} composer - An effect composer.
	 */

	constructor(composer) {

		super(composer);

		/**
		 * A bokeh pass.
		 *
		 * @type {BloomPass}
		 * @private
		 */

		this.bokehPass = null;

	}

	/**
	 * Loads scene assets.
	 *
	 * @param {Function} callback - A callback function.
	 */

	load(callback) {

		const assets = new Map();
		const loadingManager = this.loadingManager;
		const cubeTextureLoader = new CubeTextureLoader(loadingManager);

		const path = "textures/skies/space3/";
		const format = ".jpg";
		const urls = [
			path + "px" + format, path + "nx" + format,
			path + "py" + format, path + "ny" + format,
			path + "pz" + format, path + "nz" + format
		];

		if(this.assets === null) {

			loadingManager.onProgress = (item, loaded, total) => {

				if(loaded === total) {

					this.assets = assets;

					callback();

				}

			};

			cubeTextureLoader.load(urls, function(textureCube) {

				assets.set("sky", textureCube);

			});

		} else {

			callback();

		}

	}

	/**
	 * Creates the scene.
	 */

	initialise() {

		const scene = this.scene;
		const camera = this.camera;
		const assets = this.assets;
		const composer = this.composer;

		// Controls.

		this.controls = new OrbitControls(camera, composer.renderer.domElement);
		this.controls.enablePan = false;
		this.controls.minDistance = 12;
		this.controls.maxDistance = 40;
		this.controls.zoomSpeed = 0.2;
		this.controls.rotateSpeed = 0.2;

		// Camera.

		camera.near = 1;
		camera.far = 50;
		camera.position.set(12.5, -0.3, 1.7);
		camera.lookAt(this.controls.target);

		// Sky.

		scene.background = assets.get("sky");

		// Lights.

		const ambientLight = new AmbientLight(0x404040);
		const directionalLight = new DirectionalLight(0xffbbaa);

		directionalLight.position.set(-1, 1, 1);
		directionalLight.target.position.copy(scene.position);

		scene.add(directionalLight);
		scene.add(ambientLight);

		// Objects.

		const geometry = new CylinderBufferGeometry(1, 1, 20, 6);
		const material = new MeshPhongMaterial({
			color: 0xffaaaa,
			flatShading: true,
			envMap: assets.get("sky")
		});

		const mesh = new Mesh(geometry, material);
		mesh.rotation.set(0, 0, Math.PI / 2);
		scene.add(mesh);

		// Passes.

		composer.addPass(new RenderPass(scene, camera));

		const pass = new BokehPass(camera, {
			focus: 0.32,
			dof: 0.02,
			aperture: 0.015,
			maxBlur: 0.025
		});

		pass.renderToScreen = true;
		this.bokehPass = pass;
		composer.addPass(pass);

	}

	/**
	 * Registers configuration options.
	 *
	 * @param {GUI} gui - A GUI.
	 */

	configure(gui) {

		const pass = this.bokehPass;

		const params = {
			"focus": pass.bokehMaterial.uniforms.focus.value,
			"dof": pass.bokehMaterial.uniforms.dof.value,
			"aperture": pass.bokehMaterial.uniforms.aperture.value,
			"blur": pass.bokehMaterial.uniforms.maxBlur.value
		};

		gui.add(params, "focus").min(0.0).max(1.0).step(0.001).onChange(function() {

			pass.bokehMaterial.uniforms.focus.value = params.focus;

		});

		gui.add(params, "dof").min(0.0).max(1.0).step(0.001).onChange(function() {

			pass.bokehMaterial.uniforms.dof.value = params.dof;

		});

		gui.add(params, "aperture").min(0.0).max(0.05).step(0.0001).onChange(function() {

			pass.bokehMaterial.uniforms.aperture.value = params.aperture;

		});

		gui.add(params, "blur").min(0.0).max(0.1).step(0.001).onChange(function() {

			pass.bokehMaterial.uniforms.maxBlur.value = params.blur;

		});

	}

}
