(function() { "use strict";

	/**
	 * Loads assets.
	 *
	 * @method loadAssets
	 */

	window.addEventListener("load", function loadAssets() {

		window.removeEventListener("load", loadAssets);

		const loadingManager = new THREE.LoadingManager();
		const textureLoader = new THREE.TextureLoader(loadingManager);
		const cubeTextureLoader = new THREE.CubeTextureLoader(loadingManager);

		const assets = {};

		loadingManager.onProgress = function(item, loaded, total) {

			if(loaded === total) { setupScene(assets); }

		};

		const path = "textures/skies/space5/";
		const format = ".jpg";
		const urls = [
			path + "px" + format, path + "nx" + format,
			path + "py" + format, path + "ny" + format,
			path + "pz" + format, path + "nz" + format
		];

		cubeTextureLoader.load(urls, function(textureCube) {

			assets.sky = textureCube;

		});

		textureLoader.load("textures/moon.jpg", function(texture) {

			assets.moonColorMap = texture;

		});

		textureLoader.load("textures/moonnormals.jpg", function(texture) {

			assets.moonNormalMap = texture;

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
		scene.fog = new THREE.FogExp2(0x000000, 0.0001);

		// Sky.

		scene.background = assets.sky;

		// Camera.

		const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 100000);
		const controls = new THREE.OrbitControls(camera, renderer.domElement);
		controls.target.set(0, 0, 0);
		controls.damping = 0.2;
		controls.enablePan = false;
		controls.minDistance = 200;
		camera.position.set(-275, 0, -275);
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

		const ambientLight = new THREE.AmbientLight(0x000000);
		const directionalLight = new THREE.DirectionalLight(0xffffff);

		directionalLight.position.set(-1, 1, 0);
		directionalLight.target.position.copy(scene.position);

		scene.add(ambientLight);
		scene.add(directionalLight);

		// Moon.

		assets.moonColorMap.anisotropy = renderer.getMaxAnisotropy();

		const material = new THREE.MeshStandardMaterial({
			color: 0xd4d4d4,
			map: assets.moonColorMap,
			normalMap: assets.moonNormalMap,
			roughness: 0.75,
			metalness: 0.0,
			fog: true
		});

		const moon = new THREE.Mesh(new THREE.SphereBufferGeometry(100, 64, 64), material);

		scene.add(moon);

		// Post-Processing.

		const composer = new POSTPROCESSING.EffectComposer(renderer);
		composer.addPass(new POSTPROCESSING.RenderPass(scene, camera));

		const pass = new POSTPROCESSING.ToneMappingPass({
			adaptive: true,
			resolution: 256,
			distinction: 2.0
		});

		pass.renderToScreen = true;
		composer.addPass(pass);

		// Shader settings.

		const params = {
			"resolution": Math.round(Math.log(pass.resolution) / Math.log(2)),
			"adaptive": pass.adaptive,
			"distinction": pass.luminosityMaterial.uniforms.distinction.value,
			"adaption rate": pass.adaptiveLuminosityMaterial.uniforms.tau.value,
			"average lum": pass.toneMappingMaterial.uniforms.averageLuminance.value,
			"max lum": pass.toneMappingMaterial.uniforms.maxLuminance.value,
			"middle grey": pass.toneMappingMaterial.uniforms.middleGrey.value,
			"moon color": moon.material.color.getHex(),
			"directional light": directionalLight.color.getHex(),
			"ambient light": ambientLight.color.getHex()
		};

		gui.add(params, "resolution").min(6).max(11).step(1).onChange(function() { pass.resolution = Math.pow(2, params["resolution"]); });
		gui.add(params, "adaptive").onChange(function() { pass.adaptive = params["adaptive"]; });

		let f = gui.addFolder("Luminance");
		f.add(params, "distinction").min(1.0).max(10.0).step(0.1).onChange(function() { pass.luminosityMaterial.uniforms.distinction.value = params["distinction"]; });
		f.add(params, "adaption rate").min(0.0).max(2.0).step(0.1).onChange(function() { pass.adaptiveLuminosityMaterial.uniforms.tau.value = params["adaption rate"]; });
		f.add(params, "average lum").min(0.0).max(1.0).step(0.01).onChange(function() { pass.toneMappingMaterial.uniforms.averageLuminance.value = params["average lum"]; });
		f.add(params, "max lum").min(0.0).max(32.0).step(1.0).onChange(function() { pass.toneMappingMaterial.uniforms.maxLuminance.value = params["max lum"]; });
		f.add(params, "middle grey").min(0.0).max(1.0).step(0.01).onChange(function() { pass.toneMappingMaterial.uniforms.middleGrey.value = params["middle grey"]; });
		f.open();

		f = gui.addFolder("Colors");
		f.addColor(params, "moon color").onChange(function() { moon.material.color.setHex(params["moon color"]); });
		f.addColor(params, "ambient light").onChange(function() { ambientLight.color.setHex(params["ambient light"]); });
		f.addColor(params, "directional light").onChange(function() { directionalLight.color.setHex(params["directional light"]); });

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

			moon.rotation.x += 0.0001;
			moon.rotation.y += 0.0001;

			composer.render(clock.getDelta() * 10.0);

			// Prevent overflow.
			if(moon.rotation.x >= TWO_PI) { moon.rotation.x -= TWO_PI; }
			if(moon.rotation.y >= TWO_PI) { moon.rotation.y -= TWO_PI; }

			stats.end();

		}());

	};

}());
