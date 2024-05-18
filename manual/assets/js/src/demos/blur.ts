import {
	CubeTextureLoader,
	HalfFloatType,
	LoadingManager,
	PerspectiveCamera,
	SRGBColorSpace,
	Scene,
	Texture,
	VSMShadowMap,
	WebGLRenderer
} from "three";

import {
	ClearPass,
	EffectPass,
	GaussianBlurPass,
	GeometryPass,
	MultiPassKawaseBlurPass,
	RenderPipeline,
	TextureEffect,
	ToneMappingEffect
} from "postprocessing";

import { Pane } from "tweakpane";
import { ControlMode, SpatialControls } from "spatial-controls";
import * as CornellBox from "../objects/CornellBox.js";
import * as Utils from "../utils/index.js";

function load(): Promise<Map<string, Texture>> {

	const assets = new Map<string, Texture>();
	const loadingManager = new LoadingManager();
	const cubeTextureLoader = new CubeTextureLoader(loadingManager);

	return new Promise<Map<string, Texture>>((resolve, reject) => {

		loadingManager.onLoad = () => resolve(assets);
		loadingManager.onError = (url) => reject(new Error(`Failed to load ${url}`));

		cubeTextureLoader.load(Utils.getSkyboxUrls("sunset"), (t) => {

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

	renderer.debug.checkShaderErrors = Utils.isLocalhost;
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
	scene.background = assets.get("sky") as Texture;
	scene.add(CornellBox.createLights());
	scene.add(CornellBox.createEnvironment());
	scene.add(CornellBox.createActors());

	// Post Processing

	const gaussianBlurPass = new GaussianBlurPass({
		kernelSize: 35,
		iterations: 1,
		resolutionScale: 0.5
	});

	const multiPassKawaseBlurPass = new MultiPassKawaseBlurPass({
		scale: 0.35,
		levels: 2
	});

	const textureEffect = new TextureEffect({ texture: gaussianBlurPass.texture });

	const pipeline = new RenderPipeline(renderer);
	pipeline.add(
		new ClearPass(),
		new GeometryPass(scene, camera, {
			frameBufferType: HalfFloatType,
			samples: 4
		}),
		gaussianBlurPass,
		multiPassKawaseBlurPass,
		new EffectPass(
			textureEffect,
			new ToneMappingEffect()
		)
	);

	// Settings

	const pane = new Pane({ container: container.querySelector(".tp") as HTMLElement });
	const fpsGraph = Utils.createFPSGraph(pane);

	const folder = pane.addFolder({ title: "Settings" });
	const tab = folder.addTab({
		pages: [
			{ title: "Gauss" },
			{ title: "Kawase" }
		]
	});

	tab.on("select", (event) => {

		gaussianBlurPass.enabled = (event.index === 0);
		multiPassKawaseBlurPass.enabled = (event.index === 1);

		textureEffect.texture = event.index === 0 ? gaussianBlurPass.texture : multiPassKawaseBlurPass.texture;

	});

	const gaussKernels = {
		"7x7": 7,
		"15x15": 15,
		"25x25": 25,
		"35x35": 35,
		"63x63": 63,
		"127x127": 127,
		"255x255": 255
	};

	const p0 = tab.pages[0];
	p0.addBinding(gaussianBlurPass.fullscreenMaterial, "kernelSize", { options: gaussKernels });
	p0.addBinding(gaussianBlurPass.fullscreenMaterial, "scale", { min: 0, max: 2, step: 0.01 });
	p0.addBinding(gaussianBlurPass.resolution, "scale", { label: "resolution", min: 0.5, max: 1, step: 0.01 });
	p0.addBinding(gaussianBlurPass, "iterations", { min: 1, max: 8, step: 1 });

	const p1 = tab.pages[1];
	// TODO: is it ok that the following two scale parameters are independant from each other?
	p1.addBinding(
		multiPassKawaseBlurPass.downsamplingMaterial, "scale", { label: "downsample scale", min: 0, max: 2, step: 0.01 });
	p1.addBinding(
		multiPassKawaseBlurPass.upsamplingMaterial, "scale", { label: "upsample scale", min: 0, max: 2, step: 0.01 });
	p1.addBinding(multiPassKawaseBlurPass.resolution, "scale", { label: "resolution", min: 0.5, max: 1, step: 0.01 });
	p1.addBinding(multiPassKawaseBlurPass, "levels", { min: 1, max: 8, step: 1 });

	// Resize Handler

	function onResize(): void {

		const width = container.clientWidth, height = container.clientHeight;
		camera.aspect = width / height;
		camera.fov = Utils.calculateVerticalFoV(90, Math.max(camera.aspect, 16 / 9));
		camera.updateProjectionMatrix();
		pipeline.setSize(width, height);

	}

	window.addEventListener("resize", onResize);
	onResize();

	// Render Loop

	requestAnimationFrame(function render(timestamp: number): void {

		fpsGraph.begin();
		controls.update(timestamp);
		pipeline.render(timestamp);
		fpsGraph.end();

		requestAnimationFrame(render);

	});

}));
