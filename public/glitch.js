window.addEventListener("load", function init() {

	window.removeEventListener("load", init);

	// Renderer and Scene.

	var renderer = new THREE.WebGLRenderer({antialias: true, logarithmicDepthBuffer: true});
	var scene = new THREE.Scene();
	scene.fog = new THREE.FogExp2(0x000000, 0.001);
	renderer.setClearColor(0x000000);
	renderer.setSize(window.innerWidth, window.innerHeight);
	document.body.appendChild(renderer.domElement);

	// Camera.

	var camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 20000);
	var controls = new THREE.OrbitControls(camera, renderer.domElement);
	controls.target.set(0, 0, 0);
	controls.damping = 0.2;
	camera.position.set(0, 200, 450);
	camera.lookAt(controls.target);

	// FPS.

	var stats = new Stats();
	stats.setMode(0);
	document.body.appendChild(stats.domElement);

	scene.add(camera);

	// Lights.

	var hemisphereLight = new THREE.HemisphereLight(0xffffbb, 0x080820, 1);
	var directionalLight = new THREE.DirectionalLight(0xffbbaa);

	directionalLight.position.set(-1, 1, 1);
	directionalLight.target.position.copy(scene.position);

	scene.add(directionalLight);
	scene.add(hemisphereLight);

	// Random objects.

	object = new THREE.Object3D();

	var i, mesh;
	var geometry = new THREE.SphereBufferGeometry(1, 4, 4);
	var material = new THREE.MeshPhongMaterial({color: 0xffffff, shading: THREE.FlatShading});

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

	var composer = new POSTPROCESSING.EffectComposer(renderer);
	var pass = new POSTPROCESSING.RenderPass(scene, camera);
	composer.addPass(pass);

	var textureLoader = new THREE.TextureLoader();

	textureLoader.load("textures/perturb.jpg", function(texture) {

		texture.magFilter = texture.minFilter = THREE.NearestFilter;

		pass = new POSTPROCESSING.GlitchPass({
			perturbMap: texture
		});

		//pass.goWild = true;
		pass.renderToScreen = true;
		composer.addPass(pass);

	});

	// Effect toggle.

	document.addEventListener("keyup", function(event) {

		var key = event.keyCode || event.which;

		if(key === 32) {

			pass.goWild = !pass.goWild;

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
