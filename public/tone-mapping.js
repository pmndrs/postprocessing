window.addEventListener("load", function loadAssets() {

	window.removeEventListener("load", loadAssets);

	var loadingManager = new THREE.LoadingManager();
	var textureLoader = new THREE.TextureLoader(loadingManager);
	var cubeTextureLoader = new THREE.CubeTextureLoader(loadingManager);

	var assets = {};

	loadingManager.onProgress = function(item, loaded, total) {

		if(loaded === total) { setupScene(assets); }

	};

	var path = "textures/skies/space5/";
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

		assets.sky = new THREE.Mesh(new THREE.BoxGeometry(100000, 100000, 100000), skyBoxMaterial);

	});

	textureLoader.load("textures/moon.jpg", function(texture) {

		assets.moonColorMap = texture;

	});

	textureLoader.load("textures/moonnormals.jpg", function(texture) {

		assets.moonNormalMap = texture;

	});

});

function setupScene(assets) {

	var viewport = document.getElementById("viewport");
	viewport.removeChild(viewport.children[0]);

	// Renderer and Scene.

	var renderer = new THREE.WebGLRenderer({antialias: true, logarithmicDepthBuffer: true});
	var scene = new THREE.Scene();
	scene.fog = new THREE.FogExp2(0x000000, 0.0001);
	renderer.setClearColor(0x000000);
	renderer.setSize(window.innerWidth, window.innerHeight);
	viewport.appendChild(renderer.domElement);

	// Camera.

	var camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 100000);
	var controls = new THREE.OrbitControls(camera, renderer.domElement);
	controls.target.set(0, 0, 0);
	controls.damping = 0.2;
	controls.enablePan = false;
	controls.minDistance = 200;
	camera.position.set(-275, 0, -275);
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

	var ambientLight = new THREE.AmbientLight(0x2d200f);
	var directionalLight = new THREE.DirectionalLight(0xffeeaa);

	directionalLight.position.set(-1, 1, 0);
	directionalLight.target.position.copy(scene.position);

	scene.add(ambientLight);
	scene.add(directionalLight);

	// Sky.

	camera.add(assets.sky);

	// Moon.

	//assets.moonColorMap.anisotropy = renderer.getMaxAnisotropy();

	var material = new THREE.MeshPhongMaterial({
		color: 0xd4d4d4,
		map: assets.moonColorMap,
		normalMap: assets.moonNormalMap,
		shininess: 10,
		fog: true
	});

	var moon = new THREE.Mesh(new THREE.SphereBufferGeometry(100, 64, 64), material);

	scene.add(moon);

	// Post-Processing.

	var composer = new POSTPROCESSING.EffectComposer(renderer);
	var pass = new POSTPROCESSING.RenderPass(scene, camera);
	composer.addPass(pass);

	pass = new POSTPROCESSING.ToneMappingPass({
		adaptive: true,
		resolution: 256,
		distinction: 2.0
	});

	pass.renderToScreen = true;
	composer.addPass(pass);

	// Shader settings.

	var params = {
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

	var f = gui.addFolder("Luminance");
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
	var clock = new THREE.Clock(true);

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
