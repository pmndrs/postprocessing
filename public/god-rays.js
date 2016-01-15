window.addEventListener("load", function init() {

	window.removeEventListener("load", init);

	// Renderer and Scene.

	var renderer = new THREE.WebGLRenderer({antialias: true, logarithmicDepthBuffer: true});
	var scene = new THREE.Scene();
	scene.fog = new THREE.FogExp2(0x000000, 0.00025);
	renderer.setClearColor(0x000000);
	renderer.setSize(window.innerWidth, window.innerHeight);
	document.body.appendChild(renderer.domElement);

	// Camera.

	var camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 100000);
	var controls = new THREE.OrbitControls(camera, renderer.domElement);
	controls.target.set(0, 50, 0);
	controls.damping = 0.2;
	camera.position.set(-550, -175, -400);
	camera.lookAt(controls.target);

	// FPS.

	var stats = new Stats();
	stats.setMode(0);
	document.body.appendChild(stats.domElement);

	scene.add(camera);

	// Lights.

	var hemisphereLight = new THREE.HemisphereLight(0xffffee, 0x080820, 1);
	var directionalLight = new THREE.DirectionalLight(0xffbbaa);

	directionalLight.position.set(38000, 5000, 50000);
	directionalLight.target.position.copy(scene.position);

	scene.add(directionalLight);
	scene.add(hemisphereLight);

	// Helpers.

	//scene.add(new THREE.DirectionalLightHelper(directionalLight, 1.0));

	// Sky.

	var path = "textures/skies/sunset/";
	var format = ".png";
	var urls = [
		path + "px" + format, path + "nx" + format,
		path + "py" + format, path + "ny" + format,
		path + "pz" + format, path + "nz" + format
	];

	var sky;

	var cubeTextureLoader = new THREE.CubeTextureLoader();
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

		sky = new THREE.Mesh(new THREE.BoxGeometry(100000, 100000, 100000), skyBoxMaterial);
		sky.ignoreOverrideMaterial = true; // Hack.

		// Move the sky with the camera.
		camera.add(sky);

	});

	// Load a model.

	var object;

	var loader = new THREE.ObjectLoader();
	var textureLoader = new THREE.TextureLoader();

	loader.load("models/waggon.json", function(object) {

		textureLoader.load("textures/wood.jpg", function(colorMap) {

			colorMap.wrapS = colorMap.wrapT = THREE.RepeatWrapping;

			textureLoader.load("textures/woodnormals.jpg", function(normalMap) {

				normalMap.wrapS = normalMap.wrapT = THREE.RepeatWrapping;

				var material = new THREE.MeshPhongMaterial({
					color: 0xffffff,
					map: colorMap,
					normalMap: normalMap,
					fog: true
				});

				//object = o;
				object.scale.multiplyScalar(100.0);
				object.rotation.y = Math.PI * 0.75;
				object.rotation.x = Math.PI * 0.25;
				object.traverse(function(child) { child.material = material; })
				scene.add(object);

			});

		});

	});

	// Post-Processing.

	var composer = new POSTPROCESSING.EffectComposer(renderer);
	var pass = new POSTPROCESSING.RenderPass(scene, camera);
	composer.addPass(pass);

	pass = new POSTPROCESSING.GodRaysPass(scene, camera, directionalLight, {
		resolution: 512,
		rayLength: 1.5,
		intensity: 1.0,
		decay: 1.0,
		weight: 1.0,
		exposure: 1.0,
		samples: 9
	});

	pass.renderToScreen = true;
	composer.addPass(pass);

	/**
	 * Effect toggle for closer light source.
	 */

	var sun = new THREE.Mesh(new THREE.SphereBufferGeometry(600, 32, 32), new THREE.MeshBasicMaterial({color: 0xffddaa, fog: false}));

	/*var sunMaterial = new THREE.PointsMaterial({size: 600, sizeAttenuation: false, color: 0xffddaa, alphaTest: 0.0, transparent: true, fog: false});
	var sunGeometry = new THREE.Geometry();
	sunGeometry.vertices.push(new THREE.Vector3());
	var sun = new THREE.Points(sunGeometry, sunMaterial);

	textureLoader.load("textures/sun.png", function(texture) {

		sunMaterial.map = texture;

	});*/

	sun.ignoreOverrideMaterial = true; // Hack.
	sun.position.set(1440, 400, 2000);

	document.addEventListener("keyup", function(event) {

		var key = event.keyCode || event.which;

		if(key === 32) {

			if(sky.ignoreOverrideMaterial) {

				pass.godRaysGenerateMaterial.uniforms.weight.value = 0.68767;
				pass.exposure = 3.0;
				pass.lightSource = sun;
				sky.ignoreOverrideMaterial = false;
				scene.add(sun);

			} else {

				pass.godRaysGenerateMaterial.uniforms.weight.value = 1.0;
				pass.exposure = 1.0;
				pass.lightSource = directionalLight;
				sky.ignoreOverrideMaterial = true;
				scene.remove(sun);

			}

		}

	});

	/**
	 * Handles resizing.
	 */

	window.addEventListener("resize", function resize() {

		var width = window.innerWidth;
		var height = window.innerHeight;

		renderer.setSize(width, height);
		camera.aspect = width / height;
		camera.updateProjectionMatrix();
		composer.reset();

	});

	/**
	 * Animation loop.
	 */

	(function render(now) {

		stats.begin();

		composer.render();

		stats.end();

		requestAnimationFrame(render);

	}());

});
