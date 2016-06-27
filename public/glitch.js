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

		const path = "textures/skies/space4/";
		const format = ".jpg";
		const urls = [
			path + "px" + format, path + "nx" + format,
			path + "py" + format, path + "ny" + format,
			path + "pz" + format, path + "nz" + format
		];

		cubeTextureLoader.load(urls, function(textureCube) {

			assets.sky = textureCube;

		});

		textureLoader.load("textures/perturb.jpg", function(texture) {

			texture.magFilter = texture.minFilter = THREE.NearestFilter;
			assets.perturbMap = texture;

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
		scene.fog = new THREE.FogExp2(0x000000, 0.001);

		// Sky.

		scene.background = assets.sky;

		// Camera.

		const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 20000);
		const controls = new THREE.OrbitControls(camera, renderer.domElement);
		controls.target.set(0, 0, 0);
		controls.damping = 0.2;
		controls.enablePan = false;
		controls.maxDistance = 1500;
		camera.position.set(0, 200, 450);
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

		const hemisphereLight = new THREE.HemisphereLight(0xffffbb, 0x080820, 1);
		const directionalLight = new THREE.DirectionalLight(0xffbbaa);

		directionalLight.position.set(-1, 1, 1);
		directionalLight.target.position.copy(scene.position);

		scene.add(directionalLight);
		scene.add(hemisphereLight);

		// Random objects.

		const object = new THREE.Object3D();

		const geometry = new THREE.SphereBufferGeometry(1, 4, 4);

		let material = new THREE.MeshPhongMaterial({color: 0xffffff, shading: THREE.FlatShading});

		let i, mesh;

		for(i = 0; i < 100; ++i) {

			material = new THREE.MeshPhongMaterial({color: 0xffffff * Math.random(), shading: THREE.FlatShading});

			mesh = new THREE.Mesh(geometry, material);
			mesh.position.set(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize();
			mesh.position.multiplyScalar(Math.random() * 400);
			mesh.rotation.set(Math.random() * 2, Math.random() * 2, Math.random() * 2);
			mesh.scale.x = mesh.scale.y = mesh.scale.z = Math.random() * 50;
			object.add(mesh);

		}

		scene.add(object);

		// Post-Processing.

		const composer = new POSTPROCESSING.EffectComposer(renderer);
		composer.addPass(new POSTPROCESSING.RenderPass(scene, camera));

		const pass = new POSTPROCESSING.GlitchPass({
			perturbMap: assets.perturbMap
		});

		pass.renderToScreen = true;
		composer.addPass(pass);

		// Shader settings.

		const params = {
			"mode": pass.mode
		};

		gui.add(params, "mode").min(POSTPROCESSING.GlitchPass.Mode.SPORADIC).max(POSTPROCESSING.GlitchPass.Mode.CONSTANT_WILD)
			.step(1).onChange(function() { pass.mode = params["mode"]; });

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

		(function render(now) {

			requestAnimationFrame(render);

			stats.begin();

			object.rotation.x += 0.005;
			object.rotation.y += 0.01;

			composer.render();

			// Prevent overflow.
			if(object.rotation.x >= TWO_PI) { object.rotation.x -= TWO_PI; }
			if(object.rotation.y >= TWO_PI) { object.rotation.y -= TWO_PI; }

			stats.end();

		}());

	}

}());
