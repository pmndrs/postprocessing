import {
	AmbientLight,
	BoxGeometry,
	CubeTextureLoader,
	CylinderGeometry,
	DirectionalLight,
	Group,
	HalfFloatType,
	LoadingManager,
	Mesh,
	MeshBasicMaterial,
	MeshLambertMaterial,
	PerspectiveCamera,
	PlaneGeometry,
	Scene,
	SRGBColorSpace,
	Texture,
	TextureLoader,
	VSMShadowMap,
	WebGLRenderer
} from "three";

import {
	ClearPass,
	EffectPass,
	FXAAEffect,
	GeometryPass,
	RenderPipeline,
	ToneMappingEffect
} from "postprocessing";

import { Timer } from "three/examples/jsm/misc/Timer.js";
import { Pane } from "tweakpane";
import { ControlMode, SpatialControls } from "spatial-controls";
import * as CornellBox from "../objects/CornellBox.js";
import * as Utils from "../utils/index.js";

function load(): Promise<Map<string, Texture>> {

	const assets = new Map<string, Texture>();
	const loadingManager = new LoadingManager();
	const cubeTextureLoader = new CubeTextureLoader(loadingManager);
	const textureLoader = new TextureLoader(loadingManager);

	return new Promise<Map<string, Texture>>((resolve, reject) => {

		loadingManager.onLoad = () => resolve(assets);
		loadingManager.onError = (url) => reject(new Error(`Failed to load ${url}`));

		cubeTextureLoader.load(Utils.getSkyboxUrls("sunset"), (t) => {

			t.colorSpace = SRGBColorSpace;
			assets.set("sky", t);

		});

		textureLoader.load(`${document.baseURI}img/textures/example-nameplate.png`, (t) => {

			t.colorSpace = SRGBColorSpace;
			t.anisotropy = 4;
			assets.set("example-nameplate", t);

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
	renderer.shadowMap.type = VSMShadowMap;
	renderer.shadowMap.autoUpdate = false;
	renderer.shadowMap.needsUpdate = true;
	renderer.shadowMap.enabled = true;

	const container = document.getElementById("viewport")!;
	container.prepend(renderer.domElement);

	// Camera & Controls

	const camera = new PerspectiveCamera(50, 1, 1, 1000);
	const controls = new SpatialControls(camera.position, camera.quaternion, renderer.domElement);
	const settings = controls.settings;
	settings.general.mode = ControlMode.THIRD_PERSON;
	settings.rotation.sensitivity = 2.2;
	settings.rotation.damping = 0.05;
	settings.zoom.sensitivity = 0.15;
	settings.zoom.damping = 0.1;
	settings.translation.enabled = false;
	controls.position.set(0, 0, 5);

	// Main Scene, Lights and Objects

	const scene = new Scene();
	scene.background = assets.get("sky")!;
	const actors = CornellBox.createActors();
	scene.add(CornellBox.createLights());
	scene.add(CornellBox.createEnvironment());
	scene.add(actors);

	// UI Scene, Lights and Objects

	const uiScene = new Scene();

	const healthPosition = actors.children[0].position.clone();
	const coinPosition = actors.children[1].position.clone();
	const nameplatePosition = actors.children[2].position.clone();

	healthPosition.y += 0.8;
	coinPosition.y += 0.5;
	nameplatePosition.y += 0.4;

	const nameplate = new Mesh(
		new PlaneGeometry(1, 0.125),
		new MeshBasicMaterial({
			map: assets.get("example-nameplate"),
			transparent: true
		})
	);

	nameplate.position.copy(nameplatePosition);
	nameplate.onBeforeRender = () => nameplate.lookAt(camera.position);
	uiScene.add(nameplate);

	const coin = new Mesh(
		new CylinderGeometry(1, 1, 0.2),
		new MeshLambertMaterial({ color: 0xffbc00 })
	);

	coin.scale.setScalar(0.075);
	coin.position.copy(coinPosition);
	coin.rotation.z = Math.PI * 0.5;
	uiScene.add(coin);

	const health = new Group();
	health.add(
		new Mesh(
			new BoxGeometry(1, 0.2, 0.2),
			new MeshLambertMaterial({ color: 0x00ff00 })
		),
		new Mesh(
			new BoxGeometry(0.2, 1, 0.2),
			new MeshLambertMaterial({ color: 0x00ff00 })
		)
	);

	health.scale.setScalar(0.15);
	health.position.copy(healthPosition);
	health.rotation.z = Math.PI * 0.5;
	uiScene.add(health);

	const directionalLight = new DirectionalLight(0xffffff, 8);
	directionalLight.position.set(-0.5, 1, 0.25);
	uiScene.add(directionalLight, directionalLight.target);
	uiScene.add(new AmbientLight(0xcccccc, 3));

	// Post Processing

	const pipeline = new RenderPipeline(renderer);
	const clearPass = new ClearPass();
	const geometryPass = new GeometryPass(scene, camera, { frameBufferType: HalfFloatType });
	const effectPass = new EffectPass(new ToneMappingEffect());
	const uiPass = new GeometryPass(uiScene, camera, { frameBufferType: HalfFloatType, depthBuffer: true });
	const antialiasingPass = new EffectPass(new FXAAEffect());

	pipeline.add(clearPass, geometryPass, effectPass, uiPass, antialiasingPass);

	// Settings

	const params = {
		depthAware: true
	};

	const pane = new Pane({ container: container.querySelector<HTMLElement>(".tp")! });
	const fpsGraph = Utils.createFPSGraph(pane);

	const folder = pane.addFolder({ title: "Settings" });
	folder.addBinding(params, "depthAware").on("change", (e) => {

		if(e.value) {

			uiPass.output.removeDefaultBuffer();

		} else {

			uiPass.output.defaultBuffer = effectPass.output.defaultBuffer;

		}

	});

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

	const timer = new Timer();

	renderer.setAnimationLoop((timestamp: number) => {

		fpsGraph.begin();
		controls.update(timestamp);
		timer.update(timestamp);

		coin.rotation.y = (coin.rotation.y + timer.getDelta() * 5) % Math.PI;
		health.position.y = (healthPosition.y + Math.sin(timer.getElapsed()) * 0.025);

		pipeline.render(timestamp);
		fpsGraph.end();

	});

}));
