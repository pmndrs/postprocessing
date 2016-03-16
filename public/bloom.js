window.addEventListener("load", function loadAssets() {

	window.removeEventListener("load", loadAssets);

	var loadingManager = new THREE.LoadingManager();
	var cubeTextureLoader = new THREE.CubeTextureLoader(loadingManager);

	var assets = {};

	loadingManager.onProgress = function(item, loaded, total) {

		if(loaded === total) { setupScene(assets); }

	};

	var path = "textures/skies/space2/";
	var format = ".jpg";
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

		assets.sky = new THREE.Mesh(new THREE.BoxGeometry(20000, 20000, 20000), skyBoxMaterial);

	});

});

function setupScene(assets) {

	// Renderer and Scene.

	var renderer = new THREE.WebGLRenderer({antialias: true, logarithmicDepthBuffer: true});
	var scene = new THREE.Scene();
	scene.fog = new THREE.FogExp2(0x000000, 0.0001);
	renderer.setClearColor(0x000000);
	renderer.setSize(window.innerWidth, window.innerHeight);
	document.getElementById("viewport").appendChild(renderer.domElement);

	// Camera.

	var camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 20000);
	var controls = new THREE.OrbitControls(camera, renderer.domElement);
	controls.target.set(0, 0, 0);
	controls.damping = 0.2;
	controls.maxDistance = 10000;
	camera.position.set(-1000, 1000, 1500);
	camera.lookAt(controls.target);

	scene.add(camera);

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

	var ambientLight = new THREE.AmbientLight(0x666666);
	var directionalLight = new THREE.DirectionalLight(0xffbbaa);

	directionalLight.position.set(-1, 1, 1);
	directionalLight.target.position.copy(scene.position);

	scene.add(directionalLight);
	scene.add(ambientLight);

	// Sky.

	camera.add(assets.sky);

	// Random objects.

	object = new THREE.Object3D();

	var i, mesh;
	var geometry = new THREE.SphereBufferGeometry(1, 4, 4);
	var material = new THREE.MeshBasicMaterial({color: 0xffffff, shading: THREE.FlatShading});

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

	var geometry = new THREE.BoxGeometry(25, 825, 25);
	var material = new THREE.MeshLambertMaterial({color: 0x0b0b0b});
	var mesh = new THREE.Mesh(geometry, material);

	var o = new THREE.Object3D();
	var o0, o1, o2;

	o0 = o.clone();

	var clone = mesh.clone();
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

	var composer = new POSTPROCESSING.EffectComposer(renderer);
	composer.addPass(new POSTPROCESSING.RenderPass(scene, camera));

	var pass = new POSTPROCESSING.BloomPass({
		resolutionScale: 0.5,
		blurriness: 1.0,
		strength: 1.0,
		distinction: 4.0
	});

	pass.renderToScreen = true;
	composer.addPass(pass);

	// Shader settings.

	var params = {
		"resolution": pass.resolutionScale,
		"blurriness": pass.blurriness,
		"strength": pass.combineMaterial.uniforms.opacity2.value,
		"distinction": pass.luminosityMaterial.uniforms.distinction.value,
		"blend": true
	};

	gui.add(params, "resolution").min(0.0).max(1.0).step(0.01).onChange(function() { pass.resolutionScale = params["resolution"]; composer.setSize(); });
	gui.add(params, "blurriness").min(0.0).max(3.0).step(0.1).onChange(function() { pass.blurriness = params["blurriness"]; });
	gui.add(params, "strength").min(0.0).max(3.0).step(0.01).onChange(function() { pass.combineMaterial.uniforms.opacity2.value = params["strength"]; });

	var f = gui.addFolder("Luminance");
	f.add(params, "distinction").min(1.0).max(10.0).step(0.1).onChange(function() { pass.luminosityMaterial.uniforms.distinction.value = params["distinction"]; });
	f.open();

	gui.add(params, "blend").onChange(function() {

		pass.combineMaterial.uniforms.opacity1.value = params["blend"] ? 1.0 : 0.0;

	});

	/**
	 * Handles resizing.
	 */

	window.addEventListener("resize", function resize() {

		var width = window.innerWidth;
		var height = window.innerHeight;

		composer.setSize(width, height);
		camera.aspect = width / height;
		camera.updateProjectionMatrix();

	});

	/**
	 * Animation loop.
	 */

	var TWO_PI = 2.0 * Math.PI;

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
