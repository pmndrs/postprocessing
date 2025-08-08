import {
	CubeTextureLoader,
	LoadingManager,
	PerspectiveCamera,
	PointLight,
	SRGBColorSpace,
	Scene,
	Texture,
	TextureLoader,
	WebGLRenderer
} from "three";

import {
	ClearPass,
	EffectPass,
	GeometryPass,
	RenderPipeline,
	ToneMappingEffect
} from "postprocessing";

import { GLTF, GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { Pane } from "tweakpane";
import { SpatialControls } from "spatial-controls";
import * as Utils from "../utils/index.js";

function load(): Promise<Map<string, Texture | GLTF>> {

	const assets = new Map<string, Texture | GLTF>();
	const loadingManager = new LoadingManager();
	const gltfLoader = new GLTFLoader(loadingManager);
	const cubeTextureLoader = new CubeTextureLoader(loadingManager);
	const textureLoader = new TextureLoader(loadingManager);

	return new Promise<Map<string, Texture | GLTF>>((resolve, reject) => {

		loadingManager.onLoad = () => resolve(assets);
		loadingManager.onError = (url) => reject(new Error(`Failed to load ${url}`));

		cubeTextureLoader.load(Utils.getSkyboxUrls("space-02", ".jpg"), (t) => {

			t.colorSpace = SRGBColorSpace;
			assets.set("sky", t);

		});

		textureLoader.load("img/textures/perturb.jpg", (t) => {

			assets.set("perturb", t);

		});

		gltfLoader.load(
			`${document.baseURI}models/venator-hallway/venator-hallway.glb`,
			(gltf) => assets.set("model", gltf)
		);

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
	settings.translation.sensitivity = 2;
	controls.position.set(0, 1.5, -1);
	controls.lookAt(0, 1.45, 1);

	// Scene, Lights, Objects

	const scene = new Scene();
	const skyMap = assets.get("sky") as Texture;
	scene.background = skyMap;
	scene.environment = skyMap;

	const light0 = new PointLight(0xffffff, 20, 0, 2);
	light0.position.set(0, 2, 0);
	scene.add(light0);

	const light1 = new PointLight(0xffffff, 10, 6, 2);
	light1.position.set(0, 2, 8);
	scene.add(light1);

	const light2 = new PointLight(0xffffff, 20, 20, 2);
	light2.position.set(15, 2, 0);
	scene.add(light2);

	const light3 = new PointLight(0xffffff, 10, 6, 2);
	light3.position.set(-8, 2, 0);
	scene.add(light3);

	const gltf = assets.get("model") as GLTF;
	Utils.setAnisotropy(gltf.scene, Math.min(8, renderer.capabilities.getMaxAnisotropy()));
	scene.add(gltf.scene);

	// Post Processing

	/*
	const effect = new ChromaticAberrationEffect({
		offset: new Vector2(0.0025, 0.0025),
		radialModulation: true
	});
	*/

	const pipeline = new RenderPipeline(renderer);
	pipeline.add(
		new ClearPass(),
		new GeometryPass(scene, camera, { samples: 4 }),
		new EffectPass(new ToneMappingEffect())
	);

	// Settings

	const container = document.getElementById("viewport")!;
	const pane = new Pane({ container: container.querySelector<HTMLElement>(".tp")! });
	const fpsGraph = Utils.createFPSGraph(pane);

	/*
	const folder = pane.addFolder({ title: "Settings" });
	folder.addBinding(effect, "radialModulation");
	folder.addBinding(effect, "modulationOffset", { min: 0, max: 1.5, step: 1e-2 });
	folder.addBinding(effect, "offset", {
		x: { min: -1e-2, max: 1e-2, step: 1e-5 },
		y: { min: -1e-2, max: 1e-2, step: 1e-5, inverted: true }
	});

	Utils.addBlendModeBindings(folder, effect.blendMode);
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
			(entries) => renderer.setAnimationLoop(entries[0].isIntersecting ? render : null)
		);

		container.prepend(renderer.domElement);
		viewportObserver.observe(container);

	}).catch((e) => console.error(e));

}));
