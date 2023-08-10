import {
	CubeTextureLoader,
	FogExp2,
	LoadingManager,
	PerspectiveCamera,
	Scene,
	SRGBColorSpace,
	WebGLRenderer
} from "three";

import {
	BlendFunction,
	DepthOfFieldEffect,
	EffectComposer,
	EffectPass,
	KernelSize,
	RenderPass,
	TextureEffect
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
	controls.position.set(0, 0, 1);
	controls.lookAt(0, 0, 0);

	// Scene, Lights, Objects

	const scene = new Scene();
	scene.fog = new FogExp2(0x373134, 0.06);
	scene.background = assets.get("sky");
	scene.add(Domain.createLights());
	scene.add(Domain.createEnvironment(scene.background));
	scene.add(Domain.createActors(scene.background));

	// Post Processing

	const composer = new EffectComposer(renderer, {
		multisampling: Math.min(4, renderer.capabilities.maxSamples)
	});

	const effect = new DepthOfFieldEffect(camera, {
		kernelSize: KernelSize.SMALL,
		worldFocusDistance: 2,
		worldFocusRange: 5,
		bokehScale: 3.0,
		resolutionScale: 0.75
	});

	const effectPass = new EffectPass(camera, effect);

	// BEGIN DEBUG
	const cocDebugPass = new EffectPass(camera, new TextureEffect({ texture: effect.cocTexture }));
	effectPass.renderToScreen = true;
	cocDebugPass.renderToScreen = true;
	cocDebugPass.enabled = false;
	cocDebugPass.fullscreenMaterial.encodeOutput = false;
	// END DEBUG

	composer.addPass(new RenderPass(scene, camera));
	composer.addPass(effectPass);
	composer.addPass(cocDebugPass);

	// Settings

	const fpsMeter = new FPSMeter();
	const cocMaterial = effect.cocMaterial;
	const pane = new Pane({ container: container.querySelector(".tp") });
	pane.addBinding(fpsMeter, "fps", { readonly: true, label: "FPS" });

	const folder = pane.addFolder({ title: "Settings" });
	folder.addBinding(cocDebugPass, "enabled", { label: "debug" });
	folder.addBinding(effect.resolution, "scale", { label: "resolution", min: 0.5, max: 1, step: 0.05 });

	folder.addBinding(effect.blurPass, "kernelSize", { options: KernelSize });
	folder.addBinding(cocMaterial, "worldFocusDistance", { min: 0, max: 50, step: 0.1 });
	folder.addBinding(cocMaterial, "worldFocusRange", { min: 0, max: 20, step: 0.1 });
	folder.addBinding(effect, "bokehScale", { min: 0, max: 7, step: 1e-2 });
	folder.addBinding(effect.blendMode.opacity, "value", { label: "opacity", min: 0, max: 1, step: 0.01 });
	folder.addBinding(effect.blendMode, "blendFunction", { options: BlendFunction });

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
