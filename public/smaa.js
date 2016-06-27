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

		const path = "textures/skies/sunset/";
		const format = ".png";
		const urls = [
			path + "px" + format, path + "nx" + format,
			path + "py" + format, path + "ny" + format,
			path + "pz" + format, path + "nz" + format
		];

		cubeTextureLoader.load(urls, function(textureCube) {

			assets.sky = textureCube;

		});

		textureLoader.load("textures/crate.jpg", function(texture) {

			texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
			assets.colorMap = texture;

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

		const renderer = new THREE.WebGLRenderer({antialias: false, logarithmicDepthBuffer: true});
		renderer.setClearColor(0x000000);
		renderer.setSize(window.innerWidth, window.innerHeight);
		viewport.appendChild(renderer.domElement);

		const rendererAA = new THREE.WebGLRenderer({antialias: true, logarithmicDepthBuffer: true});
		rendererAA.setClearColor(0x000000);
		rendererAA.autoClear = false;
		rendererAA.setSize(window.innerWidth, window.innerHeight);

		const scene = new THREE.Scene();
		scene.fog = new THREE.FogExp2(0x000000, 0.0025);

		// Sky.

		scene.background = assets.sky;

		// Camera.

		const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 2000);
		const controls = new THREE.OrbitControls(camera, renderer.domElement);
		controls.target.set(0, 0, 0);
		controls.damping = 0.2;
		camera.position.set(-3, 0, -3);
		camera.lookAt(controls.target);

		scene.add(camera);

		const controlsAA = new THREE.OrbitControls(camera, rendererAA.domElement);
		controlsAA.target.set(0, 0, 0);
		controlsAA.damping = 0.2;

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

		let geometry = new THREE.BoxGeometry(1, 1, 1);

		let material = new THREE.MeshBasicMaterial({
			color: 0x000000,
			wireframe: true
		});

		const object1 = new THREE.Mesh(geometry, material);
		object1.position.set(1.25, 0, -1.25);

		scene.add(object1);

		material = new THREE.MeshLambertMaterial({
			map: assets.colorMap
		});

		const object2 = new THREE.Mesh(geometry, material);
		object2.position.set(-1.25, 0, 1.25);

		scene.add(object2);

		// Cage.

		geometry = new THREE.BoxGeometry(0.25, 8.25, 0.25);
		material = new THREE.MeshLambertMaterial({color: 0x0d0d0d});

		const mesh = new THREE.Mesh(geometry, material);

		const o = new THREE.Object3D();

		let o0, o1, o2;

		o0 = o.clone();

		let clone = mesh.clone();
		clone.position.set(-4, 0, 4);
		o0.add(clone);
		clone = mesh.clone();
		clone.position.set(4, 0, 4);
		o0.add(clone);
		clone = mesh.clone();
		clone.position.set(-4, 0, -4);
		o0.add(clone);
		clone = mesh.clone();
		clone.position.set(4, 0, -4);
		o0.add(clone);

		o1 = o0.clone();
		o1.rotation.set(Math.PI / 2, 0, 0);
		o2 = o0.clone();
		o2.rotation.set(0, 0, Math.PI / 2);

		o.add(o0);
		o.add(o1);
		o.add(o2);

		o.scale.set(0.1, 0.1, 0.1);

		scene.add(o);

		// Post-Processing.

		const composer = new POSTPROCESSING.EffectComposer(renderer);
		const renderPass = new POSTPROCESSING.RenderPass(scene, camera);
		composer.addPass(renderPass);

		const smaaPass = new POSTPROCESSING.SMAAPass(Image);

		smaaPass.renderToScreen = true;
		composer.addPass(smaaPass);

		// Shader settings.

		const params = {
			"browser AA": false,
			"SMAA": smaaPass.enabled,
			"SMAA threshold": Number.parseFloat(smaaPass.colorEdgesMaterial.defines.EDGE_THRESHOLD)
		};

		function toggleSMAA() {

			renderPass.renderToScreen = !params["SMAA"];
			smaaPass.enabled = params["SMAA"];

		}

		function switchRenderers() {

			if(params["browser AA"]) {

				viewport.removeChild(renderer.domElement);
				viewport.appendChild(rendererAA.domElement);
				composer.renderer = rendererAA;
				controlsAA.enabled = true;

			} else {

				viewport.removeChild(rendererAA.domElement);
				viewport.appendChild(renderer.domElement);
				composer.renderer = renderer;
				controls.enabled = true;

			}

			resize();

		}

		gui.add(params, "browser AA").onChange(switchRenderers);
		gui.add(params, "SMAA").onChange(toggleSMAA);

		gui.add(params, "SMAA threshold").min(0.0).max(0.5).step(0.01).onChange(function() {
			smaaPass.colorEdgesMaterial.defines.EDGE_THRESHOLD = params["SMAA threshold"].toFixed(2);
			smaaPass.colorEdgesMaterial.needsUpdate = true;
		});

		/**
		 * Handles resizing.
		 *
		 * @method resize
		 */

		function resize() {

			const width = window.innerWidth;
			const height = window.innerHeight;

			composer.setSize(width, height);
			camera.aspect = width / height;
			camera.updateProjectionMatrix();

		}

		window.addEventListener("resize", resize);

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

			object1.rotation.x += 0.0005;
			object1.rotation.y += 0.001;
			object2.rotation.copy(object1.rotation);
			o.rotation.copy(object1.rotation);

			composer.render(clock.getDelta());

			// Prevent overflow.
			if(object1.rotation.x >= TWO_PI) { object1.rotation.x -= TWO_PI; }
			if(object1.rotation.y >= TWO_PI) { object1.rotation.y -= TWO_PI; }

			stats.end();

		}());

	};

}());
