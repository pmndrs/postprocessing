import {
	Color,
	CubeTextureLoader,
	FogExp2,
	IcosahedronGeometry,
	LoadingManager,
	Mesh,
	MeshBasicMaterial,
	PerspectiveCamera,
	Scene,
	sRGBEncoding,
	WebGLRenderer
} from "three";

import {
	BlendFunction,
	EffectComposer,
	EffectPass,
	GodRaysEffect,
	KernelSize,
	RenderPass
} from "postprocessing";

import { Pane } from "tweakpane";
import { SpatialControls } from "spatial-controls";
import { calculateVerticalFoV, FPSMeter, toRecord } from "../utils";
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

			t.encoding = sRGBEncoding;
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
	renderer.physicallyCorrectLights = true;
	renderer.outputEncoding = sRGBEncoding;

	const container = document.querySelector(".viewport");
	container.prepend(renderer.domElement);

	// Camera & Controls

	const camera = new PerspectiveCamera();
	const controls = new SpatialControls(camera.position, camera.quaternion, renderer.domElement);
	const settings = controls.settings;
	settings.rotation.setSensitivity(2.2);
	settings.rotation.setDamping(0.05);
	settings.translation.setDamping(0.1);
	controls.setPosition(-1, -0.3, -30);
	controls.lookAt(0, 0, -35);

	// Scene, Lights, Objects

	const scene = new Scene();
	scene.fog = new FogExp2(0x0a0809, 0.06);
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

	const context = renderer.getContext();
	const composer = new EffectComposer(renderer, {
		multisampling: Math.min(4, context.getParameter(context.MAX_SAMPLES))
	});

	const effect = new GodRaysEffect(camera, sun, {
		kernelSize: KernelSize.SMALL,
		density: 0.96,
		decay: 0.92,
		weight: 0.3,
		exposure: 0.54,
		samples: 32,
		height: 480
	});

	const effectPass = new EffectPass(camera, effect);
	composer.addPass(new RenderPass(scene, camera));
	composer.addPass(effectPass);

	// Settings

	const fpsMeter = new FPSMeter();
	const color = new Color();
	const godRaysMaterial = effect.godRaysMaterial;
	const pane = new Pane({ container: container.querySelector(".tp") });
	pane.addMonitor(fpsMeter, "fps", { label: "FPS" });

	const params = {
		"color": color.copy(sun.material.color).convertLinearToSRGB().getHex()
	};

	const folder = pane.addFolder({ title: "Settings" });
	folder.addInput(effect.resolution, "height", {
		options: [360, 480, 720, 1080].reduce(toRecord, {}),
		label: "resolution"
	});
	folder.addInput(effect, "blur");
	folder.addInput(effect.blurPass, "kernelSize", { label: "blurriness", options: KernelSize });
	folder.addInput(godRaysMaterial, "density", { min: 0, max: 1, step: 0.01 });
	folder.addInput(godRaysMaterial, "decay", { min: 0, max: 1, step: 0.01 });
	folder.addInput(godRaysMaterial, "weight", { min: 0, max: 1, step: 0.01 });
	folder.addInput(godRaysMaterial, "exposure", { min: 0, max: 1, step: 0.01 });
	folder.addInput(godRaysMaterial, "maxIntensity", { min: 0, max: 1, step: 0.01 });
	folder.addInput(godRaysMaterial, "samples", { min: 16, max: 128, step: 1 });
	folder.addInput(params, "color", { view: "color" })
		.on("change", (e) => sun.material.color.setHex(e.value).convertSRGBToLinear());
	folder.addInput(effect.blendMode.opacity, "value", { label: "opacity", min: 0, max: 1, step: 0.01 });
	folder.addInput(effect.blendMode, "blendFunction", { options: BlendFunction });

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
