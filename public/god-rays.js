/**
 * Manual asset loading.
 */

window.addEventListener("load", function loadAssets() {

	window.removeEventListener("load", loadAssets);

	var loadingManager = new THREE.LoadingManager();
	var textureLoader = new THREE.TextureLoader(loadingManager);
	var modelLoader = new THREE.ObjectLoader(loadingManager);
	var cubeTextureLoader = new THREE.CubeTextureLoader(loadingManager);

	var assets = {};

	loadingManager.onProgress = function(item, loaded, total) {

		if(loaded === total) { setupScene(assets); }

	};

	var path = "textures/skies/starry/";
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

	textureLoader.load("textures/sun.png", function(texture) {

		assets.sunTexture = texture;

	});

});

function setupScene(assets) {

	// Renderer and Scene.

	var renderer = new THREE.WebGLRenderer({antialias: true, logarithmicDepthBuffer: true});
	var scene = new THREE.Scene();
	scene.fog = new THREE.FogExp2(0x000000, 0.0001);
	renderer.setClearColor(0x000000);
	renderer.setSize(window.innerWidth, window.innerHeight);
	document.body.appendChild(renderer.domElement);

	// Camera.

	var camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 100000);
	var controls = new THREE.OrbitControls(camera, renderer.domElement);
	controls.target.set(0, 50, 0);
	controls.damping = 0.2;
	camera.position.set(-550, -50, -400);
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

	var hemisphereLight = new THREE.HemisphereLight(0xffffee, 0x080820, 1);
	var directionalLight = new THREE.DirectionalLight(0xffbbaa);

	directionalLight.position.set(1440, 200, 2000);
	directionalLight.target.position.copy(scene.position);

	scene.add(directionalLight);
	scene.add(hemisphereLight);

	// Sky.

	// Move the sky with the camera.
	camera.add(assets.sky);

	// Waggon model.

	var waggonMaterial = new THREE.MeshPhongMaterial({
		color: 0xffffff,
		map: assets.waggonColorMap,
		normalMap: assets.waggonNormalMap,
		fog: true
	});

	assets.waggon.traverse(function(child) { child.material = waggonMaterial; });

	scene.add(assets.waggon);

	// Sun.

	var sun = new THREE.Mesh(
		new THREE.SphereBufferGeometry(600, 32, 32),
		new THREE.MeshBasicMaterial({color: 0xffddaa, fog: false})
	);

	/*var sunMaterial = new THREE.PointsMaterial({
		map: assets.sunTexture,
		size: 600,
		sizeAttenuation: false,
		color: 0xffddaa,
		alphaTest: 0.0,
		transparent: true,
		fog: false
	});

	var sunGeometry = new THREE.Geometry();
	sunGeometry.vertices.push(new THREE.Vector3());
	var sun = new THREE.Points(sunGeometry, sunMaterial);*/

	sun.ignoreOverrideMaterial = true; // Hack.
	sun.position.copy(directionalLight.position);
	scene.add(sun);

	// Post-Processing.

	var composer = new POSTPROCESSING.EffectComposer(renderer);
	var pass = new POSTPROCESSING.RenderPass(scene, camera);
	composer.addPass(pass);

	pass = new POSTPROCESSING.GodRaysPass(scene, camera, directionalLight, {
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

	var params = {
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

	(function render(now) {

		requestAnimationFrame(render);

		stats.begin();

		composer.render();

		stats.end();

	}());

};
