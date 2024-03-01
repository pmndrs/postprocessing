import {
	CubeTextureLoader,
	HalfFloatType,
	LoadingManager,
	PerspectiveCamera,
	RepeatWrapping,
	SRGBColorSpace,
	Scene,
	Texture,
	TextureLoader,
	VSMShadowMap,
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

		cubeTextureLoader.load(Utils.getSkyboxUrls("space", ".jpg"), (t) => {

			t.colorSpace = SRGBColorSpace;
			assets.set("sky", t);

		});

		textureLoader.load(`${document.baseURI}img/textures/lens-dirt/scratches.jpg`, (t) => {

			t.colorSpace = SRGBColorSpace;
			t.wrapS = t.wrapT = RepeatWrapping;
			assets.set("scratches", t);

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
	settings.rotation.sensitivity = 2.2;
	settings.rotation.damping = 0.025;
	settings.translation.damping = 0.1;
	controls.position.set(0, 1, 2);
	controls.lookAt(0, 0, 0);

	// Scene, Lights, Objects

	const scene = new Scene();
	const skyMap = assets.get("sky") as Texture;
	scene.background = skyMap;
	scene.environment = skyMap;
	scene.fog = DefaultEnvironment.createFog();
	scene.add(DefaultEnvironment.createEnvironment());

	// Post Processing

	const pipeline = new RenderPipeline(renderer);
	pipeline.add(
		new ClearPass(),
		new GeometryPass(scene, camera, {
			frameBufferType: HalfFloatType,
			samples: 4
		})
	);

	/*
	const effect = new TextureEffect({
		texture: assets.get("scratches")
	});

	effect.blendMode.blendFunction = new ColorDodgeBlendFunction();
	pipeline.addPass(new EffectPass(effect, new ToneMappingEffect()));
	*/

	// Settings

	const pane = new Pane({ container: container.querySelector(".tp") as HTMLElement });
	const fpsGraph = Utils.createFPSGraph(pane);

	/*
	const texture = effect.texture;
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

	Utils.addBlendModeBindings(folder, effect.blendMode);
	*/

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
