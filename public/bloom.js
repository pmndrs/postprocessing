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

	var camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 20000);
	var controls = new THREE.OrbitControls(camera, renderer.domElement);
	controls.target.set(0, 0, 0);
	controls.damping = 0.2;
	camera.position.set(-1000, 1000, 1500);
	camera.lookAt(controls.target);

	// FPS.

	var stats = new Stats();
	stats.setMode(0);
	document.body.appendChild(stats.domElement);

	scene.add(camera);

	// Lights.

	var ambientLight = new THREE.AmbientLight(0x666666);
	var directionalLight = new THREE.DirectionalLight(0xffbbaa);

	directionalLight.position.set(-1, 1, 1);
	directionalLight.target.position.copy(scene.position);

	scene.add(directionalLight);
	scene.add(ambientLight);

	// Random objects.

	object = new THREE.Object3D();

	var i, mesh;
	var geometry = new THREE.SphereBufferGeometry(1, 4, 4);
	var material = new THREE.MeshPhongMaterial({color: 0x00f000, shading: THREE.FlatShading});

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
	var material = new THREE.MeshLambertMaterial({color: 0x060606});
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
		strength: 1.0,
		kernelSize: 25,
		sigma: 4,
		resolution: 512
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

		object.rotation.x += 0.001;
		object.rotation.y += 0.005;

		composer.render();

		// Prevent overflow.
		if(object.rotation.x >= TWO_PI) { object.rotation.x -= TWO_PI; }
		if(object.rotation.y >= TWO_PI) { object.rotation.y -= TWO_PI; }

		stats.end();

		requestAnimationFrame(render);

	}());

});
