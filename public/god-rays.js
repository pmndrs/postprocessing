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
		const modelLoader = new THREE.ObjectLoader(loadingManager);
		const cubeTextureLoader = new THREE.CubeTextureLoader(loadingManager);

		const assets = {};

		loadingManager.onProgress = function(item, loaded, total) {

			if(loaded === total) { setupScene(assets); }

		};

		const path = "textures/skies/starry/";
		const format = ".png";
		const urls = [
			path + "px" + format, path + "nx" + format,
			path + "py" + format, path + "ny" + format,
			path + "pz" + format, path + "nz" + format
		];

		cubeTextureLoader.load(urls, function(textureCube) {

			assets.sky = textureCube;

		});

		modelLoader.load("models/waggon.json", function(object) {

			object.scale.multiplyScalar(100.0);
			object.rotation.y = Math.PI * 0.75;
			object.rotation.x = Math.PI * 0.25;
			assets.waggon = object;

		});

		textureLoader.load("textures/wood.jpg", function(texture) {

			texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
			assets.waggonColorMap = texture;

		});

		textureLoader.load("textures/woodnormals.jpg", function(texture) {

			texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
			assets.waggonNormalMap = texture;

		});

		/*textureLoader.load("textures/sun.png", function(texture) {

			assets.sunTexture = texture;

		});*/

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
		controls.target.set(0, 50, 0);
		controls.damping = 0.2;
		camera.position.set(-550, -50, -400);
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

		const hemisphereLight = new THREE.HemisphereLight(0xffffee, 0x080820, 1);
		const directionalLight = new THREE.DirectionalLight(0xffbbaa);

		directionalLight.position.set(1440, 200, 2000);
		directionalLight.target.position.copy(scene.position);

		scene.add(directionalLight);
		scene.add(hemisphereLight);

		// Waggon model.

		const waggonMaterial = new THREE.MeshPhongMaterial({
			color: 0xffffff,
			map: assets.waggonColorMap,
			normalMap: assets.waggonNormalMap,
			fog: true
		});

		assets.waggon.traverse(function(child) { child.material = waggonMaterial; });

		scene.add(assets.waggon);

		// Sun.

		const sun = new THREE.Mesh(
			new THREE.SphereBufferGeometry(600, 32, 32),
			new THREE.MeshBasicMaterial({color: 0xffddaa, fog: false})
		);

		/*const sunMaterial = new THREE.PointsMaterial({
			map: assets.sunTexture,
			size: 600,
			sizeAttenuation: false,
			color: 0xffddaa,
			alphaTest: 0.0,
			transparent: true,
			fog: false
		});

		const sunGeometry = new THREE.Geometry();
		sunGeometry.vertices.push(new THREE.Vector3());
		const sun = new THREE.Points(sunGeometry, sunMaterial);*/

		sun.ignoreOverrideMaterial = true; // Hack.
		sun.position.copy(directionalLight.position);
		scene.add(sun);

		// Post-Processing.

		const composer = new POSTPROCESSING.EffectComposer(renderer);
		composer.addPass(new POSTPROCESSING.RenderPass(scene, camera));

		const pass = new POSTPROCESSING.GodRaysPass(scene, camera, directionalLight, {
			resolutionScale: 0.6,
			blurriness: 0.1,
			intensity: 1.0,
			density: 0.96,
			decay: 0.93,
			weight: 0.4,
			exposure: 0.6,
			samples: 60,
			clampMax: 1.0
		});

		pass.renderToScreen = true;
		composer.addPass(pass);

		// Shader settings.

		const params = {
			"resolution": pass.resolutionScale,
			"intensity": pass.intensity,
			"density": pass.godRaysMaterial.uniforms.density.value,
			"decay": pass.godRaysMaterial.uniforms.decay.value,
			"weight": pass.godRaysMaterial.uniforms.weight.value,
			"exposure": pass.godRaysMaterial.uniforms.exposure.value,
			"clampMax": pass.godRaysMaterial.uniforms.clampMax.value,
			"samples": pass.samples,
			"blurriness": pass.blurriness,
			"color": sun.material.color.getHex()
		};

		gui.add(params, "resolution").min(0.0).max(1.0).step(0.01).onChange(function() { pass.resolutionScale = params["resolution"]; composer.setSize(); });
		gui.add(params, "blurriness").min(0.0).max(2.0).step(0.01).onChange(function() { pass.blurriness = params["blurriness"]; });
		gui.add(params, "intensity").min(0.0).max(1.0).step(0.01).onChange(function() { pass.intensity = params["intensity"]; });
		gui.add(params, "density").min(0.0).max(1.0).step(0.01).onChange(function() { pass.godRaysMaterial.uniforms.density.value = params["density"]; });
		gui.add(params, "decay").min(0.0).max(1.0).step(0.01).onChange(function() { pass.godRaysMaterial.uniforms.decay.value = params["decay"]; });
		gui.add(params, "weight").min(0.0).max(1.0).step(0.01).onChange(function() { pass.godRaysMaterial.uniforms.weight.value = params["weight"]; });
		gui.add(params, "exposure").min(0.0).max(1.0).step(0.01).onChange(function() { pass.godRaysMaterial.uniforms.exposure.value = params["exposure"]; });
		gui.add(params, "clampMax").min(0.0).max(1.0).step(0.01).onChange(function() { pass.godRaysMaterial.uniforms.clampMax.value = params["clampMax"]; });
		gui.add(params, "samples").min(15).max(200).step(1).onChange(function() { pass.samples = params["samples"]; });
		gui.addColor(params, "color").onChange(function() { sun.material.color.setHex(params["color"]); directionalLight.color.setHex(params["color"]); });

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

		(function render(now) {

			requestAnimationFrame(render);

			stats.begin();

			composer.render();

			stats.end();

		}());

	};

}());
