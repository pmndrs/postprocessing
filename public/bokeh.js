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

		const pass = new POSTPROCESSING.BokehPass(camera, {
			focus: 0.0,
			aperture: 0.007,
			maxBlur: 0.025
		});

		pass.renderToScreen = true;
		composer.addPass(pass);

		// Shader settings.

		const params = {
			"focus": pass.bokehMaterial.uniforms.focus.value,
			"aperture": pass.bokehMaterial.uniforms.aperture.value,
			"max blur": pass.bokehMaterial.uniforms.maxBlur.value,
			"realistic version": function() { window.location.href = "bokeh2.html"; }
		};

		gui.add(params, "focus").min(0.0).max(1.0).step(0.001).onChange(function() { pass.bokehMaterial.uniforms.focus.value = params["focus"]; });
		gui.add(params, "aperture").min(0.0).max(0.05).step(0.0001).onChange(function() { pass.bokehMaterial.uniforms.aperture.value = params["aperture"]; });
		gui.add(params, "max blur").min(0.0).max(0.1).step(0.001).onChange(function() { pass.bokehMaterial.uniforms.maxBlur.value = params["max blur"]; });
		gui.add(params, "realistic version");

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

		const TWO_PI = 2.0 * Math.PI;
		const clock = new THREE.Clock(true);

		(function render(now) {

			requestAnimationFrame(render);

			stats.begin();

			composer.render(clock.getDelta());

			stats.end();

		}());

	};

}());
