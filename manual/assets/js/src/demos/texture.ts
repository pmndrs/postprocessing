import {
	CubeTexture,
	CubeTextureLoader,
	LoadingManager,
	PerspectiveCamera,
	RepeatWrapping,
	SRGBColorSpace,
	Scene,
	TextureLoader,
	VSMShadowMap,
	WebGLRenderer
} from "three";

import {
	BlendFunction,
	EffectPass,
	GeometryPass,
	RenderPipeline,
	TextureEffect
} from "postprocessing";

import { Pane } from "tweakpane";
import * as EssentialsPlugin from "@tweakpane/plugin-essentials";
import { ControlMode, SpatialControls } from "spatial-controls";
import { calculateVerticalFoV } from "../utils/CameraUtils.js";
import * as CornellBox from "../objects/CornellBox.js";

function load(): Promise<Map<string, unknown>> {

	const assets = new Map<string, unknown>();
	const loadingManager = new LoadingManager();
	const textureLoader = new TextureLoader(loadingManager);
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

		textureLoader.load(document.baseURI + "img/textures/lens-dirt/scratches.jpg", (t) => {

			t.colorSpace = SRGBColorSpace;
			t.wrapS = t.wrapT = RepeatWrapping;
			assets.set("scratches", t);

		});

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
	renderer.shadowMap.type = VSMShadowMap;
	renderer.shadowMap.autoUpdate = false;
	renderer.shadowMap.needsUpdate = true;
	renderer.shadowMap.enabled = true;

	const container = document.querySelector(".viewport") as HTMLElement;
	container.prepend(renderer.domElement);

	// Camera & Controls

	const camera = new PerspectiveCamera();
	const controls = new SpatialControls(camera.position, camera.quaternion, renderer.domElement);
	const settings = controls.settings;
	settings.general.mode = ControlMode.THIRD_PERSON;
	settings.rotation.sensitivity = 2.2;
	settings.rotation.damping = 0.05;
	settings.zoom.damping = 0.1;
	settings.translation.enabled = false;
	controls.position.set(0, 0, 5);

	// Scene, Lights, Objects

	const scene = new Scene();
	scene.background = assets.get("sky") as CubeTexture;
	scene.add(CornellBox.createLights());
	scene.add(CornellBox.createEnvironment());
	scene.add(CornellBox.createActors());

	// Post Processing

	const effect = new TextureEffect({
		blendFunction: BlendFunction.COLOR_DODGE,
		texture: assets.get("scratches")
	});

	const pipeline = new RenderPipeline(renderer);
	pipeline.addPass(new GeometryPass(scene, camera, { samples: 4 }));
	pipeline.addPass(new EffectPass(effect));

	// Settings

	const texture = effect.texture;
	const pane = new Pane({ container: container.querySelector(".tp") as HTMLElement });
	pane.registerPlugin(EssentialsPlugin);
	const fpsMeter = pane.addBlade({ view: "fpsgraph", label: "FPS", rows: 2 }) as EssentialsPlugin.FpsGraphBladeApi;

	const folder = pane.addFolder({ title: "Settings" });
	folder.addBinding(texture, "rotation", { min: 0, max: 2 * Math.PI, step: 0.001 });

	let subFolder = folder.addFolder({ title: "offset" });
	subFolder.addBinding(texture.offset, "x", { min: 0, max: 1, step: 0.001 });
	subFolder.addBinding(texture.offset, "y", { min: 0, max: 1, step: 0.001 });
	subFolder = folder.addFolder({ title: "repeat" });
	subFolder.addBinding(texture.repeat, "x", { min: 0, max: 2, step: 0.001 });
	subFolder.addBinding(texture.repeat, "y", { min: 0, max: 2, step: 0.001 });
	subFolder = folder.addFolder({ title: "center" });
	subFolder.addBinding(texture.center, "x", { min: 0, max: 1, step: 0.001 });
	subFolder.addBinding(texture.center, "y", { min: 0, max: 1, step: 0.001 });

	folder.addBinding(effect.blendMode, "opacity", { min: 0, max: 1, step: 0.01 });
	folder.addBinding(effect.blendMode, "blendFunction", { options: BlendFunction });

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

		fpsMeter.begin();
		controls.update(timestamp);
		pipeline.render(timestamp);
		fpsMeter.end();
		requestAnimationFrame(render);

	});

}));
