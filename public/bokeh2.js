(function() { "use strict";

	/**
	 * Loads assets.
	 *
	 * @method loadAssets
	 */

	window.addEventListener("load", function loadAssets() {

		window.removeEventListener("load", loadAssets);

		const loadingManager = new THREE.LoadingManager();
		const cubeTextureLoader = new THREE.CubeTextureLoader(loadingManager);

		const assets = {};

		loadingManager.onProgress = function(item, loaded, total) {

			if(loaded === total) { setupScene(assets); }

		};

		const path = "textures/skies/space3/";
		const format = ".jpg";
		const urls = [
			path + "px" + format, path + "nx" + format,
			path + "py" + format, path + "ny" + format,
			path + "pz" + format, path + "nz" + format
		];

		cubeTextureLoader.load(urls, function(textureCube) {

			assets.sky = textureCube;

		});

	});

	/**
	 * Creates the scene and initiates the render loop.
	 *
	 * @method setupScene
	 * @param {Object} assets - Preloaded assets.
	 */

	function setupScene(assets) {

		const viewport = document.getElementById("viewport");
		viewport.removeChild(viewport.children[0]);

		// Renderer and Scene.

		const renderer = new THREE.WebGLRenderer({antialias: true, logarithmicDepthBuffer: true});
		renderer.setClearColor(0x000000);
		renderer.setSize(window.innerWidth, window.innerHeight);
		viewport.appendChild(renderer.domElement);

		const scene = new THREE.Scene();
		scene.fog = new THREE.FogExp2(0x2d200f, 0.0025);

		// Sky.

		scene.background = assets.sky;

		// Camera.

		const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 2000);
		const controls = new THREE.OrbitControls(camera, renderer.domElement);
		controls.target.set(0, 0, 0);
		controls.damping = 0.2;
		controls.enablePan = false;
		controls.minDistance = 2.5;
		camera.position.set(3, 1, 3);
		camera.lookAt(controls.target);

		scene.add(camera);

		// Overlays.

		const stats = new Stats();
		stats.setMode(0);
		stats.dom.id = "stats";
		const aside = document.getElementById("aside");
		aside.style.visibility = "visible";
		aside.appendChild(stats.dom);

		const gui = new dat.GUI();
		aside.appendChild(gui.domElement.parentNode);

		// Hide interface on alt key press.
		document.addEventListener("keydown", function(event) {

			if(event.altKey) {

				event.preventDefault();
				aside.style.visibility = (aside.style.visibility === "hidden") ? "visible" : "hidden";

			}

		});

		// Lights.

		const ambientLight = new THREE.AmbientLight(0x888888);
		const directionalLight = new THREE.DirectionalLight(0xffbbaa);

		directionalLight.position.set(1440, 200, 2000);
		directionalLight.target.position.copy(scene.position);

		scene.add(ambientLight);
		scene.add(directionalLight);

		// Objects.

		const geometry = new THREE.SphereBufferGeometry(1, 64, 64);
		const material = new THREE.MeshBasicMaterial({
			color: 0xffff00,
			envMap: assets.sky
		});

		const mesh = new THREE.Mesh(geometry, material);
		scene.add(mesh);

		// Post-Processing.

		const composer = new POSTPROCESSING.EffectComposer(renderer, true);
		composer.addPass(new POSTPROCESSING.RenderPass(scene, camera));

		const pass = new POSTPROCESSING.Bokeh2Pass(camera, {
			rings: 3,
			samples: 2,
			showFocus: false,
			manualDoF: false,
			vignette: false,
			pentagon: false,
			shaderFocus: true,
			noise: true
		});

		pass.renderToScreen = true;
		composer.addPass(pass);

		// Shader settings.

		const params = {
			"rings": Number.parseInt(pass.bokehMaterial.defines.RINGS_INT),
			"samples": Number.parseInt(pass.bokehMaterial.defines.SAMPLES_INT),
			"focal stop": pass.bokehMaterial.uniforms.fStop.value,
			"focal length": pass.bokehMaterial.uniforms.focalLength.value,
			"shader focus": pass.bokehMaterial.defines.SHADER_FOCUS !== undefined,
			"focal depth": pass.bokehMaterial.uniforms.focalDepth.value,
			"focus coord X": pass.bokehMaterial.uniforms.focusCoords.value.x,
			"focus coord Y": pass.bokehMaterial.uniforms.focusCoords.value.y,
			"max blur": pass.bokehMaterial.uniforms.maxBlur.value,
			"lum threshold": pass.bokehMaterial.uniforms.luminanceThreshold.value,
			"lum gain": pass.bokehMaterial.uniforms.luminanceGain.value,
			"bias": pass.bokehMaterial.uniforms.bias.value,
			"fringe": pass.bokehMaterial.uniforms.fringe.value,
			"dithering": pass.bokehMaterial.uniforms.ditherStrength.value,
			"vignette": pass.bokehMaterial.defines.VIGNETTE !== undefined,
			"pentagon": pass.bokehMaterial.defines.PENTAGON !== undefined,
			"manual DoF": pass.bokehMaterial.defines.MANUAL_DOF !== undefined,
			"show focus": pass.bokehMaterial.defines.SHOW_FOCUS !== undefined,
			"noise": pass.bokehMaterial.defines.NOISE !== undefined,
			"simple version": function() { window.location.href = "bokeh.html"; }
		};

		let f = gui.addFolder("Focus");
		f.add(params, "show focus").onChange(function() {
			params["show focus"] ? pass.bokehMaterial.defines.SHOW_FOCUS = "1" : delete pass.bokehMaterial.defines.SHOW_FOCUS;
			pass.bokehMaterial.needsUpdate = true;
		});
		f.add(params, "shader focus").onChange(function() {
			params["shader focus"] ? pass.bokehMaterial.defines.SHADER_FOCUS = "1" : delete pass.bokehMaterial.defines.SHADER_FOCUS;
			pass.bokehMaterial.needsUpdate = true;
		});
		f.add(params, "manual DoF").onChange(function() {
			params["manual DoF"] ? pass.bokehMaterial.defines.MANUAL_DOF = "1" : delete pass.bokehMaterial.defines.MANUAL_DOF;
			pass.bokehMaterial.needsUpdate = true;
		});
		f.add(params, "focal stop").min(0.0).max(3.0).step(0.01).onChange(function() { pass.bokehMaterial.uniforms.fStop.value = params["focal stop"]; });
		f.add(params, "focal depth").min(0.1).max(35.0).step(0.1).onChange(function() { pass.bokehMaterial.uniforms.focalDepth.value = params["focal depth"]; });
		//f.add(params, "focal length").min(10.0).max(35.0).step(0.01).onChange(function() { pass.bokehMaterial.uniforms.focalLength.value = params["focal length"]; });
		f.add(params, "focus coord X").min(0.0).max(1.0).step(0.01).onChange(function() { pass.bokehMaterial.uniforms.focusCoords.value.x = params["focus coord X"]; });
		f.add(params, "focus coord Y").min(0.0).max(1.0).step(0.01).onChange(function() { pass.bokehMaterial.uniforms.focusCoords.value.y = params["focus coord Y"]; });
		f.open();

		f = gui.addFolder("Sampling");
		f.add(params, "rings").min(0).max(6).step(1).onChange(function() {
			pass.bokehMaterial.defines.RINGS_INT = params["rings"].toFixed(0);
			pass.bokehMaterial.defines.RINGS_FLOAT = params["rings"].toFixed(1);
			pass.bokehMaterial.needsUpdate = true;
		});
		f.add(params, "samples").min(0).max(6).step(1).onChange(function() {
			pass.bokehMaterial.defines.SAMPLES_INT = params["samples"].toFixed(0);
			pass.bokehMaterial.defines.SAMPLES_FLOAT = params["samples"].toFixed(1);
			pass.bokehMaterial.needsUpdate = true;
		});

		f = gui.addFolder("Blur");
		f.add(params, "max blur").min(0.0).max(1.0).step(0.001).onChange(function() { pass.bokehMaterial.uniforms.maxBlur.value = params["max blur"]; });
		f.add(params, "bias").min(0.0).max(3.0).step(0.01).onChange(function() { pass.bokehMaterial.uniforms.bias.value = params["bias"]; });
		f.add(params, "fringe").min(0.0).max(2.0).step(0.05).onChange(function() { pass.bokehMaterial.uniforms.fringe.value = params["fringe"]; });
		f.add(params, "noise").onChange(function() {
			params["noise"] ? pass.bokehMaterial.defines.NOISE = "1" : delete pass.bokehMaterial.defines.NOISE;
			pass.bokehMaterial.needsUpdate = true;
		});
		f.add(params, "dithering").min(0.0).max(0.01).step(0.0001).onChange(function() { pass.bokehMaterial.uniforms.ditherStrength.value = params["dithering"]; });
		f.add(params, "pentagon").onChange(function() {
			params["pentagon"] ? pass.bokehMaterial.defines.PENTAGON = "1" : delete pass.bokehMaterial.defines.PENTAGON;
			pass.bokehMaterial.needsUpdate = true;
		});
		f.open();

		f = gui.addFolder("Luminosity");
		f.add(params, "lum threshold").min(0.0).max(1.0).step(0.01).onChange(function() { pass.bokehMaterial.uniforms.luminanceThreshold.value = params["lum threshold"]; });
		f.add(params, "lum gain").min(0.0).max(4.0).step(0.01).onChange(function() { pass.bokehMaterial.uniforms.luminanceGain.value = params["lum gain"]; });

		gui.add(params, "vignette").onChange(function() {
			params["vignette"] ? pass.bokehMaterial.defines.VIGNETTE = "1" : delete pass.bokehMaterial.defines.VIGNETTE;
			pass.bokehMaterial.needsUpdate = true;
		});

		gui.add(params, "simple version");

		/**
		 * Handles resizing.
		 *
		 * @method resize
		 */

		window.addEventListener("resize", function resize() {

			const width = window.innerWidth;
			const height = window.innerHeight;

			composer.setSize(width, height);
			camera.aspect = width / height;
			camera.updateProjectionMatrix();

		});

		/**
		 * The main render loop.
		 *
		 * @method render
		 * @param {DOMHighResTimeStamp} now - The time when requestAnimationFrame fired.
		 */

		const clock = new THREE.Clock(true);

		(function render(now) {

			requestAnimationFrame(render);

			stats.begin();

			composer.render(clock.getDelta());

			stats.end();

		}());

	};

}());
