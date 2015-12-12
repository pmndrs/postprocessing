window.addEventListener("load", function init() {

	window.removeEventListener("load", init);

	// Renderer and Scene.

	var renderer = new THREE.WebGLRenderer({antialias: true, logarithmicDepthBuffer: true});
	var scene = new THREE.Scene();
	scene.fog = new THREE.FogExp2(0x222211, 0.00025);
	renderer.setClearColor(0x222211);
	renderer.setSize(window.innerWidth, window.innerHeight);
	document.body.appendChild(renderer.domElement);

	// Camera.

	var camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 10000);
	var controls = new THREE.OrbitControls(camera, renderer.domElement);
	controls.target.set(0, 0, 0);
	controls.damping = 0.2;
	camera.position.set(750, -300, 750);
	camera.lookAt(controls.target);

	// FPS.

	var stats = new Stats();
	stats.setMode(0);
	document.body.appendChild(stats.domElement);

	scene.add(camera);

	// Lights.

	var hemisphereLight = new THREE.HemisphereLight(0xffffbb, 0x000000, 1);
	var directionalLight = new THREE.DirectionalLight(0xffbbaa);

	directionalLight.position.set(0, 500, -1000);
	directionalLight.target.position.copy(scene.position);

	scene.add(directionalLight);
	scene.add(hemisphereLight);

	// Helpers.

	//scene.add(new THREE.DirectionalLightHelper(directionalLight, 1.0));

	// Load a model.

	var loader = new THREE.ObjectLoader();
	var textureLoader = new THREE.TextureLoader();

	loader.load("models/waggon.json", function(object) {

		textureLoader.load("textures/wood.jpg", function(colorMap) {

			colorMap.wrapS = colorMap.wrapT = THREE.RepeatWrapping;

			textureLoader.load("textures/woodnormals.jpg", function(normalMap) {

				normalMap.wrapS = normalMap.wrapT = THREE.RepeatWrapping;
				normalMap = normalMap;

				var material = new THREE.MeshPhongMaterial({
					color: 0xffffff,
					map: colorMap,
					normalMap: normalMap,
					fog: true
				});

				object.scale.multiplyScalar(100.0);
				object.rotation.y = Math.PI * 0.5;
				object.traverse(function(child) { child.material = material; })
				scene.add(object);

			});

		});

	});

	// Random objects.

	var object = new THREE.Object3D();

	var i, mesh;
	var geometry = new THREE.SphereBufferGeometry(1, 4, 4);
	var material = null;

	for(i = 0; i < 100; ++i) {

		material = new THREE.MeshPhongMaterial({color: 0xffffff * Math.random(), shading: THREE.FlatShading});

		mesh = new THREE.Mesh(geometry, material);
		mesh.position.set(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize();
		mesh.position.multiplyScalar(Math.random() * 400);
		mesh.rotation.set(Math.random() * 2, Math.random() * 2, Math.random() * 2);
		mesh.scale.x = mesh.scale.y = mesh.scale.z = Math.random() * 50;
		object.add(mesh);

	}

	//scene.add(object);

	material = new THREE.MeshPhongMaterial({color: 0x666666, shading: THREE.FlatShading});
	var plane = new THREE.Mesh(new THREE.PlaneBufferGeometry(20000, 20000), material);
	plane.position.y = -500;
	plane.rotation.x = -Math.PI * 0.5;
	scene.add(plane);

	// Post-Processing.

	var composer = new POSTPROCESSING.EffectComposer(renderer);
	var pass = new POSTPROCESSING.RenderPass(scene, camera);
	composer.addPass(pass);

	pass = new POSTPROCESSING.GodRaysPass(scene, camera, directionalLight, {
		resolution: 256,
		intensity: 0.33,
		exposure: 1.0,
		samples: 6
	});

	pass.renderToScreen = true;
	composer.addPass(pass);

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

	var TWO_PI = 2.0 * Math.PI;

	(function render(now) {

		stats.begin();

		object.rotation.x += 0.005;
		object.rotation.y += 0.01;

		composer.render();

		// Prevent overflow.
		if(object.rotation.x >= TWO_PI) { object.rotation.x -= TWO_PI; }
		if(object.rotation.y >= TWO_PI) { object.rotation.y -= TWO_PI; }

		stats.end();

		requestAnimationFrame(render);

	}());

});
