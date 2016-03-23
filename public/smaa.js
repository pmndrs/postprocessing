window.addEventListener("load", function loadAssets() {

	window.removeEventListener("load", loadAssets);

	var loadingManager = new THREE.LoadingManager();
	var textureLoader = new THREE.TextureLoader(loadingManager);
	var cubeTextureLoader = new THREE.CubeTextureLoader(loadingManager);

	var assets = {};

	loadingManager.onProgress = function(item, loaded, total) {

		if(loaded === total) { setupScene(assets); }

	};

	var path = "textures/skies/sunset/";
	var format = ".png";
	var urls = [
		path + "px" + format, path + "nx" + format,
		path + "py" + format, path + "ny" + format,
		path + "pz" + format, path + "nz" + format
	];

	cubeTextureLoader.load(urls, function(textureCube) {

		var shader = THREE.ShaderLib.cube;
		shader.uniforms.tCube.value = textureCube;

		var skyBoxMaterial = new THREE.ShaderMaterial( {
			fragmentShader: shader.fragmentShader,
			vertexShader: shader.vertexShader,
			uniforms: shader.uniforms,
			depthWrite: false,
			side: THREE.BackSide,
			fog: false
		});

		assets.sky = new THREE.Mesh(new THREE.BoxGeometry(100000, 100000, 100000), skyBoxMaterial);

	});

	textureLoader.load("textures/crate.jpg", function(texture) {

		texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
		assets.colorMap = texture;

	});

});

function setupScene(assets) {

	var viewport = document.getElementById("viewport");
	viewport.removeChild(viewport.children[0]);

	// Renderer and Scene.

	var renderer = new THREE.WebGLRenderer({antialias: false, logarithmicDepthBuffer: true});
	var scene = new THREE.Scene();
	scene.fog = new THREE.FogExp2(0x000000, 0.0025);
	renderer.setClearColor(0x000000);
	renderer.setSize(window.innerWidth, window.innerHeight);
	viewport.appendChild(renderer.domElement);

	var rendererAA = new THREE.WebGLRenderer({antialias: true, logarithmicDepthBuffer: true});
	rendererAA.setClearColor(0x000000);
	rendererAA.autoClear = false;
	rendererAA.setSize(window.innerWidth, window.innerHeight);

	// Camera.

	var camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 100000);
	var controls = new THREE.OrbitControls(camera, renderer.domElement);
	controls.target.set(0, 0, 0);
	controls.damping = 0.2;
	camera.position.set(-3, 0, -3);
	camera.lookAt(controls.target);

	scene.add(camera);

	var controlsAA = new THREE.OrbitControls(camera, rendererAA.domElement);
	controlsAA.target.set(0, 0, 0);
	controlsAA.damping = 0.2;

	// Overlays.

	var stats = new Stats();
	stats.setMode(0);
	var aside = document.getElementById("aside");
	aside.style.visibility = "visible";
	aside.appendChild(stats.domElement);

	var gui = new dat.GUI();
	aside.appendChild(gui.domElement.parentNode);

	// Hide interface on alt key press.
	document.addEventListener("keydown", function(event) {

		if(event.altKey) {

			event.preventDefault();
			aside.style.visibility = (aside.style.visibility === "hidden") ? "visible" : "hidden";

		}

	});

	// Lights.

	var ambientLight = new THREE.AmbientLight(0x888888);
	var directionalLight = new THREE.DirectionalLight(0xffbbaa);

	directionalLight.position.set(1440, 200, 2000);
	directionalLight.target.position.copy(scene.position);

	scene.add(ambientLight);
	scene.add(directionalLight);

	// Sky.

	camera.add(assets.sky);

	// Objects.

	var geometry = new THREE.BoxGeometry(1, 1, 1);

	var material = new THREE.MeshBasicMaterial({
		color: 0x000000,
		wireframe: true
	});

	var object1 = new THREE.Mesh(geometry, material);
	object1.position.set(1.25, 0, -1.25);

	scene.add(object1);

	material = new THREE.MeshLambertMaterial({
		map: assets.colorMap
	});

	var object2 = new THREE.Mesh(geometry, material);
	object2.position.set(-1.25, 0, 1.25);

	scene.add(object2);

	// Cage.

	var geometry = new THREE.BoxGeometry(0.25, 8.25, 0.25);
	var material = new THREE.MeshLambertMaterial({color: 0x0d0d0d});
	var mesh = new THREE.Mesh(geometry, material);

	var o = new THREE.Object3D();
	var o0, o1, o2;

	o0 = o.clone();

	var clone = mesh.clone();
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

	var composer = new POSTPROCESSING.EffectComposer(renderer);
	var renderPass = new POSTPROCESSING.RenderPass(scene, camera);
	composer.addPass(renderPass);

	var smaaPass = new POSTPROCESSING.SMAAPass(Image);

	smaaPass.renderToScreen = true;
	composer.addPass(smaaPass);

	// Shader settings.

	var params = {
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
	 */

	function resize() {

		var width = window.innerWidth;
		var height = window.innerHeight;

		composer.setSize(width, height);
		camera.aspect = width / height;
		camera.updateProjectionMatrix();

	}

	window.addEventListener("resize", resize);

	/**
	 * Animation loop.
	 */

	var TWO_PI = 2.0 * Math.PI;
	var clock = new THREE.Clock(true);

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
