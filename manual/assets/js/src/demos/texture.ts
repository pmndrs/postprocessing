import {
	CubeTextureLoader,
	LoadingManager,
	PerspectiveCamera,
	PointLight,
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
	ColorDodgeBlendFunction,
	EffectPass,
	GeometryPass,
	RenderPipeline,
	TextureEffect,
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

		cubeTextureLoader.load(Utils.getSkyboxUrls("space-03", ".jpg"), (t) => {

			t.colorSpace = SRGBColorSpace;
			assets.set("sky", t);

		});

		textureLoader.load(`${document.baseURI}img/textures/lens-dirt/scratches.jpg`, (t) => {

			t.colorSpace = SRGBColorSpace;
			t.wrapS = t.wrapT = RepeatWrapping;
			assets.set("scratches", t);

		});

		gltfLoader.load(
			`${document.baseURI}models/spaceship-corridor/spaceship-corridor.glb`,
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
	renderer.shadowMap.type = VSMShadowMap;
	renderer.shadowMap.autoUpdate = false;
	renderer.shadowMap.needsUpdate = true;
	renderer.shadowMap.enabled = true;

	// Camera & Controls

	const camera = new PerspectiveCamera();
	const controls = new SpatialControls(camera.position, camera.quaternion, renderer.domElement);
	const settings = controls.settings;
	settings.rotation.sensitivity = 2.2;
	settings.rotation.damping = 0.05;
	settings.translation.damping = 0.1;
	controls.position.set(0, 1, 8.25);
	controls.lookAt(0, 0.5, -1);

	// Scene, Lights, Objects

	const scene = new Scene();
	const skyMap = assets.get("sky")! as Texture;
	scene.background = skyMap;
	scene.environment = skyMap;

	const light0 = new PointLight(0xbeefff, 20, 12, 2);
	light0.position.set(0, 0.3, -5);
	scene.add(light0);

	const light1 = new PointLight(0xffedde, 6, 0, 2);
	light1.position.set(0, 1.3, 5);
	scene.add(light1);

	const gltf = assets.get("model") as GLTF;
	Utils.setAnisotropy(gltf.scene, Math.min(8, renderer.capabilities.getMaxAnisotropy()));
	scene.add(gltf.scene);

	// Post Processing

	const effect = new TextureEffect({ texture: assets.get("scratches") as Texture });
	effect.blendMode.blendFunction = new ColorDodgeBlendFunction();

	const pipeline = new RenderPipeline(renderer);
	pipeline.add(
		new ClearPass(),
		new GeometryPass(scene, camera, { samples: 4 }),
		new EffectPass(effect, new ToneMappingEffect())
	);

	// Settings

	const container = document.getElementById("viewport")!;
	const pane = new Pane({ container: container.querySelector<HTMLElement>(".tp")! });
	const fpsGraph = Utils.createFPSGraph(pane);

	const texture = effect.texture!;
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
