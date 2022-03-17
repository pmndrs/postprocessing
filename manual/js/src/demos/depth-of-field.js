import {
	CubeTextureLoader,
	FogExp2,
	LoadingManager,
	PerspectiveCamera,
	Scene,
	sRGBEncoding,
	Vector3,
	VSMShadowMap,
	WebGLRenderer
} from "three";

import {
	BlendFunction,
	DepthOfFieldEffect,
	DepthEffect,
	EffectComposer,
	EffectPass,
	KernelSize,
	RenderPass,
	TextureEffect
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
	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.outputEncoding = sRGBEncoding;
	renderer.setClearColor(0x000000, 0);
	renderer.physicallyCorrectLights = true;
	renderer.shadowMap.type = VSMShadowMap;
	renderer.shadowMap.autoUpdate = false;
	renderer.shadowMap.needsUpdate = true;
	renderer.shadowMap.enabled = true;

	const container = document.querySelector(".viewport");
	container.append(renderer.domElement);

	// Camera & Controls

	const camera = new PerspectiveCamera(1, 1, 0.3, 100);
	const controls = new SpatialControls(camera.position, camera.quaternion, renderer.domElement);
	const settings = controls.settings;
	settings.rotation.setSensitivity(2.2);
	settings.rotation.setDamping(0.05);
	settings.translation.setDamping(0.1);
	controls.setPosition(0, 0, 1);
	controls.lookAt(0, 0, 0);

	// Scene, Lights, Objects

	const scene = new Scene();
	scene.fog = new FogExp2(0x0a0809, 0.06);
	scene.background = assets.get("sky");
	scene.add(Domain.createLights());
	scene.add(Domain.createEnvironment(scene.background));
	scene.add(Domain.createActors(scene.background));

	// Post Processing

	const context = renderer.getContext();
	const composer = new EffectComposer(renderer, {
		multisampling: Math.min(4, context.getParameter(context.MAX_SAMPLES))
	});

	const effect = new DepthOfFieldEffect(camera, {
		kernelSize: KernelSize.SMALL,
		focusDistance: 0.05,
		focalLength: 0.15,
		bokehScale: 2.0,
		height: 480
	});

	const effectPass = new EffectPass(camera, effect);

	// BEGIN DEBUG
	const depthDebugPass = new EffectPass(camera, new DepthEffect());
	const cocDebugPass = new EffectPass(camera, new TextureEffect({ texture: effect.cocTexture }));

	effectPass.renderToScreen = true;
	depthDebugPass.renderToScreen = true;
	cocDebugPass.renderToScreen = true;
	depthDebugPass.enabled = false;
	cocDebugPass.enabled = false;
	depthDebugPass.fullscreenMaterial.encodeOutput = false;
	cocDebugPass.fullscreenMaterial.encodeOutput = false;
	// END DEBUG

	composer.addPass(new RenderPass(scene, camera));
	composer.addPass(effectPass);
	composer.addPass(depthDebugPass);
	composer.addPass(cocDebugPass);

	// Settings

	const fpsMeter = new FPSMeter();
	const cocMaterial = effect.cocMaterial;
	const pane = new Pane({ container: container.querySelector(".tp") });
	pane.addMonitor(fpsMeter, "fps", { label: "FPS" });

	const DoFDebug = { OFF: 0, DEPTH: 1, COC: 2 };
	const params = { debug: DoFDebug.OFF };

	const folder = pane.addFolder({ title: "Settings" });
	folder.addInput(params, "debug", { options: DoFDebug }).on("change", (e) => {

		effectPass.enabled = (e.value !== DoFDebug.DEPTH);
		depthDebugPass.enabled = (e.value === DoFDebug.DEPTH);
		cocDebugPass.enabled = (e.value === DoFDebug.COC);

	});

	folder.addInput(effect.resolution, "height", {
		options: [360, 480, 720, 1080].reduce(toRecord, {}),
		label: "resolution"
	});

	folder.addInput(effect.blurPass, "kernelSize", { options: KernelSize });
	folder.addInput(cocMaterial, "focusDistance", { min: 0, max: 1, step: 1e-3 });
	folder.addInput(cocMaterial, "focalLength", { min: 0, max: 0.3, step: 1e-3 });
	folder.addInput(effect, "bokehScale", { min: 0, max: 5, step: 1e-3 });
	folder.addInput(effect.blendMode.opacity, "value", { label: "opacity", min: 0, max: 1, step: 0.01 });
	folder.addInput(effect.blendMode, "blendFunction", { options: BlendFunction });

	// Debug Keys

	document.addEventListener("keyup", (event) => {

		const p = new Vector3();
		const v = new Vector3();

		switch(event.key) {

			case "c":
				console.log("Camera position", p.copy(controls.getPosition()));
				console.log("World direction", controls.getViewDirection(v));
				console.log("Target position", p.clone().add(v));
				break;

			case "i":
				console.log(renderer.info);
				break;

		}

	});

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
