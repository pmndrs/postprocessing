import {
	CubeTextureLoader,
	FogExp2,
	IcosahedronGeometry,
	LoadingManager,
	Mesh,
	MeshBasicMaterial,
	PerspectiveCamera,
	Scene,
	SRGBColorSpace,
	WebGLRenderer
} from "three";

import {
	EffectComposer,
	EffectPass,
	RenderPass,
	LensFlareEffect
} from "postprocessing";

import { Pane } from "tweakpane";
import { SpatialControls } from "spatial-controls";
import { calculateVerticalFoV, FPSMeter } from "../utils";
import * as Domain from "../objects/Domain";

function load() {

	const assets = new Map();
	const loadingManager = new LoadingManager();
	const cubeTextureLoader = new CubeTextureLoader(loadingManager);

	const path = document.baseURI + "img/textures/skies/sunset/";
	const format = ".png";
	const urls = [
		path + "px" + format, path + "nx" + format,
		path + "py" + format, path + "ny" + format,
		path + "pz" + format, path + "nz" + format
	];

	return new Promise((resolve, reject) => {

		loadingManager.onLoad = () => resolve(assets);
		loadingManager.onError = (url) => reject(new Error(`Failed to load ${url}`));

		cubeTextureLoader.load(urls, (t) => {

			t.colorSpace = SRGBColorSpace;
			assets.set("sky", t);

		});

	});

}

window.addEventListener("load", () => load().then((assets) => {

	// Renderer

	const renderer = new WebGLRenderer({
		powerPreference: "high-performance",
		antialias: false,
		stencil: false,
		depth: false
	});

	renderer.debug.checkShaderErrors = (window.location.hostname === "localhost");
	const container = document.querySelector(".viewport");
	container.prepend(renderer.domElement);

	// Camera & Controls

	const camera = new PerspectiveCamera();
	const controls = new SpatialControls(camera.position, camera.quaternion, renderer.domElement);
	const settings = controls.settings;
	settings.rotation.sensitivity = 2.2;
	settings.rotation.damping = 0.05;
	settings.translation.damping = 0.1;
	controls.position.set(-1, -0.3, -30);
	controls.lookAt(0, 0, -35);

	// Scene, Lights, Objects

	const scene = new Scene();
	scene.fog = new FogExp2(0x373134, 0.06);
	scene.background = assets.get("sky");
	scene.add(Domain.createLights());
	scene.add(Domain.createEnvironment(scene.background));
	scene.add(Domain.createActors(scene.background));

	const sun = new Mesh(
		new IcosahedronGeometry(1, 3),
		new MeshBasicMaterial({
			color: 0xffddaa,
			transparent: true,
			fog: false
		})
	);

	sun.position.set(0, 0.06, -1).multiplyScalar(1000);
	sun.scale.setScalar(40);
	sun.updateMatrix();
	sun.frustumCulled = false;

	// Post Processing

	const composer = new EffectComposer(renderer, {
		multisampling: Math.min(4, renderer.capabilities.maxSamples)
	});

	const effect = new LensFlareEffect(scene, camera, {
		intensity: 1.0
	});

	const effectPass = new EffectPass(camera, effect);
	composer.addPass(new RenderPass(scene, camera));
	composer.addPass(effectPass);

	// Settings

	const fpsMeter = new FPSMeter();
	const featuresMaterial = effect.featuresPass.fullscreenMaterial;
	const downsampleMaterial = effect.downsamplePass.fullscreenMaterial;
	const pane = new Pane({ container: container.querySelector(".tp") });
	pane.addBinding(fpsMeter, "fps", { readonly: true, label: "FPS" });

	const folder = pane.addFolder({ title: "Settings" });
	folder.addBinding(effect, "intensity", { min: 0, max: 10, step: 0.01 });
	folder.addBinding(featuresMaterial, "ghostAmount", { min: 0, max: 1, step: 1e-3 });
	folder.addBinding(featuresMaterial, "haloAmount", { min: 0, max: 1, step: 1e-3 });
	folder.addBinding(featuresMaterial, "chromaticAberration", { min: 0, max: 20, step: 0.1 });

	let subfolder = folder.addFolder({ title: "Luminance Filter" });
	subfolder.addBinding(downsampleMaterial, "luminanceThreshold", { min: 0, max: 1, step: 0.01 });
	subfolder.addBinding(downsampleMaterial, "luminanceSmoothing", { min: 0, max: 1, step: 0.01 });

	// Resize Handler

	function onResize() {

		const width = container.clientWidth, height = container.clientHeight;
		camera.aspect = width / height;
		camera.fov = calculateVerticalFoV(90, Math.max(camera.aspect, 16 / 9));
		camera.updateProjectionMatrix();
		composer.setSize(width, height);

	}

	window.addEventListener("resize", onResize);
	onResize();

	// Render Loop

	requestAnimationFrame(function render(timestamp) {

		fpsMeter.update(timestamp);
		controls.update(timestamp);
		composer.render();
		requestAnimationFrame(render);

	});

}));
