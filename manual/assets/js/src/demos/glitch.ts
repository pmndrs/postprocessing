import {
	CubeTextureLoader,
	LoadingManager,
	PerspectiveCamera,
	SRGBColorSpace,
	Scene,
	Texture,
	TextureLoader,
	WebGLRenderer
} from "three";

import {
	ClearPass,
	GeometryPass,
	RenderPipeline
} from "postprocessing";

import { Pane } from "tweakpane";
import { SpatialControls } from "spatial-controls";
import * as DefaultEnvironment from "../objects/DefaultEnvironment.js";
import * as Utils from "../utils/index.js";

function load(): Promise<Map<string, Texture>> {

	const assets = new Map<string, Texture>();
	const loadingManager = new LoadingManager();
	const textureLoader = new TextureLoader(loadingManager);
	const cubeTextureLoader = new CubeTextureLoader(loadingManager);

	return new Promise<Map<string, Texture>>((resolve, reject) => {

		loadingManager.onLoad = () => resolve(assets);
		loadingManager.onError = (url) => reject(new Error(`Failed to load ${url}`));

		cubeTextureLoader.load(Utils.getSkyboxUrls("space-02", ".jpg"), (t) => {

			t.colorSpace = SRGBColorSpace;
			assets.set("sky", t);

		});

		textureLoader.load(`${document.baseURI}img/textures/perturb.jpg`, (t) => {

			assets.set("noise", t);

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

	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.debug.checkShaderErrors = Utils.isLocalhost;

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
	const skyMap = assets.get("sky")!;
	scene.background = skyMap;
	scene.environment = skyMap;
	scene.fog = DefaultEnvironment.createFog();
	scene.add(DefaultEnvironment.createEnvironment());

	// Post Processing

	const pipeline = new RenderPipeline(renderer);
	pipeline.add(
		new ClearPass(),
		new GeometryPass(scene, camera, { samples: 4 })
	);

	/*
	const chromaticAberrationEffect = new ChromaticAberrationEffect();
	const effect = new GlitchEffect({ perturbationMap: assets.get("noise") });
	effect.input.uniforms.set(GlitchEffect.INPUT_UNIFORM_OFFSET, chromaticAberrationEffect.offset); // TODO not like this

	pipeline.addPass(new EffectPass(effect));
	pipeline.addPass(new EffectPass(chromaticAberrationEffect, new ToneMappingEffect());
	*/

	// Settings

	const container = document.getElementById("viewport")!;
	const pane = new Pane({ container: container.querySelector<HTMLElement>(".tp")! });
	const fpsGraph = Utils.createFPSGraph(pane);

	/*
	const noiseTexture = new NoiseTexture(64, 64, RGBAFormat);
	const params = {
		"custom pattern": true
	};

	const folder = pane.addFolder({ title: "Settings" });
	folder.addBinding(effect, "mode", { options: GlitchMode });
	folder.addBinding(effect, "minDelay", { min: 0, max: 2, step: 0.01 });
	folder.addBinding(effect, "maxDelay", { min: 2, max: 4, step: 0.01 });
	folder.addBinding(effect, "minDuration", { min: 0, max: 0.6, step: 0.01 });
	folder.addBinding(effect, "maxDuration", { min: 0.6, max: 1.8, step: 0.01 });
	folder.addBinding(effect, "minStrength", { min: 0, max: 1, step: 0.01 });
	folder.addBinding(effect, "maxStrength", { min: 0, max: 1, step: 0.01 });
	folder.addBinding(effect, "ratio", { min: 0, max: 1, step: 0.01 });
	folder.addBinding(effect, "columns", { min: 0, max: 0.5, step: 0.01 });
	folder.addBinding(params, "custom pattern")
		.on("change", (e) => effect.perturbationMap = (e.value ? assets.get("noise") : noiseTexture));
	*/

	// Resize Handler

	function onResize(): void {

		const width = container.clientWidth;
		const height = container.clientHeight;
		camera.aspect = width / height;
		camera.fov = Utils.calculateVerticalFoV(90, Math.max(camera.aspect, 16 / 9));
		camera.updateProjectionMatrix();
		pipeline.setSize(width, height);

	}

	window.addEventListener("resize", onResize);
	onResize();

	// Render Loop


	function render(timestamp: number): void {

		fpsGraph.begin();
		controls.update(timestamp);
		pipeline.render(timestamp);
		fpsGraph.end();

	}

	pipeline.compile().then(() => {

		// Only render when the canvas is visible.
		const viewportObserver = new IntersectionObserver(
			(entries) => renderer.setAnimationLoop(entries[0].isIntersecting ? render : null),
			{ threshold: 0.75 }
		);

		container.dataset.epilepsyWarning = "1";
		container.prepend(renderer.domElement);
		viewportObserver.observe(container);

	}).catch((e) => console.error(e));

}));
