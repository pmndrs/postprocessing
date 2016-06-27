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

		const path = "textures/skies/space2/";
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

		const renderer = new THREE.WebGLRenderer({antialias: false, logarithmicDepthBuffer: true});
		renderer.setClearColor(0x000000);
		renderer.setSize(window.innerWidth, window.innerHeight);
		viewport.appendChild(renderer.domElement);

		const scene = new THREE.Scene();
		scene.fog = new THREE.FogExp2(0x000000, 0.0001);

		// Sky.

		scene.background = assets.sky;

		// Camera.

		const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 20000);
		const controls = new THREE.OrbitControls(camera, renderer.domElement);
		controls.target.set(0, 0, 0);
		controls.damping = 0.2;
		controls.maxDistance = 10000;
		camera.position.set(-1000, 1000, 1500);
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

		const ambientLight = new THREE.AmbientLight(0x666666);
		const directionalLight = new THREE.DirectionalLight(0xffbbaa);

		directionalLight.position.set(-1, 1, 1);
		directionalLight.target.position.copy(scene.position);

		scene.add(directionalLight);
		scene.add(ambientLight);

		// Random objects.

		const object = new THREE.Object3D();

		let geometry = new THREE.SphereBufferGeometry(1, 4, 4);
		let material = new THREE.MeshBasicMaterial({color: 0xffffff, shading: THREE.FlatShading});
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

		// Cage.

		geometry = new THREE.BoxGeometry(25, 825, 25);
		material = new THREE.MeshLambertMaterial({color: 0x0b0b0b});
		mesh = new THREE.Mesh(geometry, material);

		const o = new THREE.Object3D();
		let o0, o1, o2;

		o0 = o.clone();

		let clone = mesh.clone();
		clone.position.set(-400, 0, 400);
		o0.add(clone);
		clone = mesh.clone();
		clone.position.set(400, 0, 400);
		o0.add(clone);
		clone = mesh.clone();
		clone.position.set(-400, 0, -400);
		o0.add(clone);
		clone = mesh.clone();
		clone.position.set(400, 0, -400);
		o0.add(clone);

		o1 = o0.clone();
		o1.rotation.set(Math.PI / 2, 0, 0);
		o2 = o0.clone();
		o2.rotation.set(0, 0, Math.PI / 2);

		o.add(o0);
		o.add(o1);
		o.add(o2);

		scene.add(o);

		// Post-Processing.

		const composer = new POSTPROCESSING.EffectComposer(renderer);
		composer.addPass(new POSTPROCESSING.RenderPass(scene, camera));

		const smaaPass = new POSTPROCESSING.SMAAPass(Image);
		smaaPass.enabled = false;
		composer.addPass(smaaPass);

		const pass = new POSTPROCESSING.BloomPass({
			resolutionScale: 0.5,
			blurriness: 1.0,
			strength: 1.0,
			distinction: 4.0
		});

		pass.renderToScreen = true;
		composer.addPass(pass);

		// Shader settings.

		const params = {
			"resolution": pass.resolutionScale,
			"blurriness": pass.blurriness,
			"strength": pass.combineMaterial.uniforms.opacity2.value,
			"distinction": pass.luminosityMaterial.uniforms.distinction.value,
			"blend": true,
			"SMAA": false
		};

		gui.add(params, "resolution").min(0.0).max(1.0).step(0.01).onChange(function() { pass.resolutionScale = params["resolution"]; composer.setSize(); });
		gui.add(params, "blurriness").min(0.0).max(3.0).step(0.1).onChange(function() { pass.blurriness = params["blurriness"]; });
		gui.add(params, "strength").min(0.0).max(3.0).step(0.01).onChange(function() { pass.combineMaterial.uniforms.opacity2.value = params["strength"]; });

		let f = gui.addFolder("Luminance");
		f.add(params, "distinction").min(1.0).max(10.0).step(0.1).onChange(function() { pass.luminosityMaterial.uniforms.distinction.value = params["distinction"]; });
		f.open();

		gui.add(params, "blend").onChange(function() {

			pass.combineMaterial.uniforms.opacity1.value = params["blend"] ? 1.0 : 0.0;

		});

		gui.add(params, "SMAA").onChange(function() {

			smaaPass.enabled = params["SMAA"];

		});

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

			object.rotation.x += 0.001;
			object.rotation.y += 0.005;

			composer.render();

			// Prevent overflow.
			if(object.rotation.x >= TWO_PI) { object.rotation.x -= TWO_PI; }
			if(object.rotation.y >= TWO_PI) { object.rotation.y -= TWO_PI; }

			stats.end();

		}());

	}

}());
