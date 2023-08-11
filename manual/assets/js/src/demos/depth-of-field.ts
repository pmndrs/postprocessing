import {
	CubeTexture,
	CubeTextureLoader,
	FogExp2,
	LoadingManager,
	PerspectiveCamera,
	SRGBColorSpace,
	Scene,
	WebGLRenderer
} from "three";

import {
	BlendFunction,
	DepthOfFieldEffect,
	EffectPass,
	GeometryPass,
	KernelSize,
	RenderPipeline,
	TextureEffect
} from "postprocessing";

import { Pane } from "tweakpane";
import { SpatialControls } from "spatial-controls";
import { calculateVerticalFoV } from "../utils/CameraUtils.js";
import { FPSMeter } from "../utils/FPSMeter.js";
import * as Domain from "../objects/Domain.js";

function load(): Promise<Map<string, unknown>> {

	const assets = new Map<string, unknown>();
	const loadingManager = new LoadingManager();
	const cubeTextureLoader = new CubeTextureLoader(loadingManager);

	const path = document.baseURI + "img/textures/skies/sunset/";
	const format = ".png";
	const urls = [
		path + "px" + format, path + "nx" + format,
		path + "py" + format, path + "ny" + format,
		path + "pz" + format, path + "nz" + format
	];

	return new Promise<Map<string, unknown>>((resolve, reject) => {

		loadingManager.onLoad = () => resolve(assets);
		loadingManager.onError = (url) => reject(new Error(`Failed to load ${url}`));

		cubeTextureLoader.load(urls, (t) => {

			t.colorSpace = SRGBColorSpace;
			assets.set("sky", t);

		});

	});

}

window.addEventListener("load", () => void load().then((assets) => {

	// Renderer

	const renderer = new WebGLRenderer({
		powerPreference: "high-performance",
		antialias: false,
		stencil: false,
		depth: false
	});

	renderer.debug.checkShaderErrors = (window.location.hostname === "localhost");
	const container = document.querySelector(".viewport") as HTMLElement;
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
	scene.background = assets.get("sky") as CubeTexture;
	scene.add(Domain.createLights());
	scene.add(Domain.createEnvironment(scene.background));
	scene.add(Domain.createActors(scene.background));

	// Post Processing

	const effect = new DepthOfFieldEffect({
		kernelSize: KernelSize.SMALL,
		worldFocusDistance: 2,
		worldFocusRange: 5,
		bokehScale: 3.0,
		resolutionScale: 0.75
	});

	const effectPass = new EffectPass(effect);

	// BEGIN DEBUG
	const cocDebugPass = new EffectPass(new TextureEffect({ texture: effect.cocTexture }));
	effectPass.output.defaultBuffer = null;
	cocDebugPass.output.defaultBuffer = null;
	cocDebugPass.enabled = false;
	cocDebugPass.fullscreenMaterial.encodeOutput = false;
	// END DEBUG

	const pipeline = new RenderPipeline(renderer);
	pipeline.autoRenderToScreen = false;
	pipeline.addPass(new GeometryPass(scene, camera, { samples: 4 }));
	pipeline.addPass(new EffectPass(effect));
	pipeline.addPass(cocDebugPass);

	// Settings

	const fpsMeter = new FPSMeter();
	const cocMaterial = effect.cocMaterial;
	const pane = new Pane({ container: container.querySelector(".tp") as HTMLElement });
	pane.addMonitor(fpsMeter, "fps", { label: "FPS" });

	const folder = pane.addFolder({ title: "Settings" });
	folder.addInput(cocDebugPass, "enabled", { label: "debug" });
	folder.addInput(effect.resolution, "scale", { label: "resolution", min: 0.5, max: 1, step: 0.05 });

	folder.addInput(effect.blurPass, "kernelSize", { options: KernelSize });
	folder.addInput(cocMaterial, "worldFocusDistance", { min: 0, max: 50, step: 0.1 });
	folder.addInput(cocMaterial, "worldFocusRange", { min: 0, max: 20, step: 0.1 });
	folder.addInput(effect, "bokehScale", { min: 0, max: 7, step: 1e-2 });
	folder.addInput(effect.blendMode.opacity, "value", { label: "opacity", min: 0, max: 1, step: 0.01 });
	folder.addInput(effect.blendMode, "blendFunction", { options: BlendFunction });

	// Resize Handler

	function onResize(): void {

		const width = container.clientWidth, height = container.clientHeight;
		camera.aspect = width / height;
		camera.fov = calculateVerticalFoV(90, Math.max(camera.aspect, 16 / 9));
		camera.updateProjectionMatrix();
		pipeline.setSize(width, height);

	}

	window.addEventListener("resize", onResize);
	onResize();

	// Render Loop

	requestAnimationFrame(function render(timestamp: number): void {

		fpsMeter.update(timestamp);
		controls.update(timestamp);
		pipeline.render(timestamp);
		requestAnimationFrame(render);

	});

}));
