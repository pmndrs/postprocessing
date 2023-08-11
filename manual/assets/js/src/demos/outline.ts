import {
	AnimationMixer,
	Color,
	CubeTexture,
	CubeTextureLoader,
	LoadingManager,
	Mesh,
	PerspectiveCamera,
	Raycaster,
	Scene,
	SRGBColorSpace,
	TextureLoader,
	Vector2,
	VSMShadowMap,
	WebGLRenderer
} from "three";

import {
	BlendFunction,
	EffectPass,
	GeometryPass,
	KernelSize,
	OutlineEffect,
	RenderPipeline
} from "postprocessing";

import { GLTF, GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { Pane } from "tweakpane";
import { ControlMode, SpatialControls } from "spatial-controls";
import { calculateVerticalFoV } from "../utils/CameraUtils.js";
import { FPSMeter } from "../utils/FPSMeter.js";
import * as Shapes from "../objects/Shapes.js";

function load(): Promise<Map<string, unknown>> {

	const assets = new Map<string, unknown>();
	const loadingManager = new LoadingManager();
	const gltfLoader = new GLTFLoader(loadingManager);
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

		gltfLoader.load(`${document.baseURI}models/rigged-simple/RiggedSimple.gltf`, (gltf: GLTF) => {

			gltf.scene.traverse((object) => {

				if(object instanceof Mesh) {

					object.castShadow = object.receiveShadow = true;

				}

			});

			assets.set("rigged-simple", gltf);

		});

		textureLoader.load(`${document.baseURI}img/textures/pattern.png`, (t) => {

			t.colorSpace = SRGBColorSpace;
			assets.set("pattern", t);

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
	controls.position.set(2, 2, 10);

	// Scene, Lights, Objects

	const scene = new Scene();
	scene.background = assets.get("sky") as CubeTexture;
	scene.add(Shapes.createLights());
	const actors = Shapes.createActors();
	scene.add(actors);

	const riggedSimple = assets.get("rigged-simple") as GLTF;
	riggedSimple.scene.scale.multiplyScalar(0.2);
	actors.add(riggedSimple.scene);

	const animationMixer = new AnimationMixer(riggedSimple.scene);
	const action = animationMixer.clipAction(riggedSimple.animations[0]);
	action.play();

	const step = 2.0 * Math.PI / actors.children.length;
	const radius = 3.0;
	let angle = 3.5;

	for(const mesh of actors.children) {

		// Arrange the objects in a circle.
		mesh.position.set(radius * Math.cos(angle), 0, radius * Math.sin(angle));
		angle += step;

	}

	// Post Processing

	const effect = new OutlineEffect(scene, camera, {
		blendFunction: BlendFunction.SCREEN,
		multisampling: Math.min(4, renderer.capabilities.maxSamples),
		patternScale: 40,
		visibleEdgeColor: 0xffffff,
		hiddenEdgeColor: 0x22090a,
		resolutionScale: 0.75,
		blur: false,
		xRay: true
	});

	effect.selection.add(actors.children[0]);

	const pipeline = new RenderPipeline(renderer);
	pipeline.addPass(new GeometryPass(scene, camera, { samples: 4 }));
	pipeline.addPass(new EffectPass(effect));

	// Object Picking

	const ndc = new Vector2();
	const raycaster = new Raycaster();
	renderer.domElement.addEventListener("pointerdown", (event) => {

		const clientRect = container.getBoundingClientRect();
		const clientX = event.clientX - clientRect.left;
		const clientY = event.clientY - clientRect.top;
		ndc.x = (clientX / container.clientWidth) * 2.0 - 1.0;
		ndc.y = -(clientY / container.clientHeight) * 2.0 + 1.0;
		raycaster.setFromCamera(ndc, camera);
		const intersects = raycaster.intersectObjects(scene.children, true);

		if(intersects.length > 0) {

			effect.selection.toggle(intersects[0].object);

		}

	});

	// Settings

	const fpsMeter = new FPSMeter();
	const color = new Color();
	const pane = new Pane({ container: container.querySelector(".tp") as HTMLElement });
	pane.addMonitor(fpsMeter, "fps", { label: "FPS" });

	const params = {
		"patternTexture": false,
		"visibleEdgeColor": color.copy(effect.visibleEdgeColor).convertLinearToSRGB().getHex(),
		"hiddenEdgeColor": color.copy(effect.hiddenEdgeColor).convertLinearToSRGB().getHex()
	};

	const folder = pane.addFolder({ title: "Settings" });
	folder.addInput(effect.resolution, "scale", { label: "resolution", min: 0.5, max: 1, step: 0.05 });
	folder.addInput(effect.blurPass, "kernelSize", { options: KernelSize });
	folder.addInput(effect.blurPass, "enabled", { label: "blur" });
	folder.addInput(params, "patternTexture")
		.on("change", (e) => effect.patternTexture = (e.value ? assets.get("pattern") : null));
	folder.addInput(effect, "patternScale", { min: 20, max: 100, step: 0.1 });
	folder.addInput(effect, "edgeStrength", { min: 0, max: 10, step: 0.01 });
	folder.addInput(effect, "pulseSpeed", { min: 0, max: 2, step: 0.01 });
	folder.addInput(params, "visibleEdgeColor", { view: "color" })
		.on("change", (e) => effect.visibleEdgeColor.setHex(e.value).convertSRGBToLinear());
	folder.addInput(params, "hiddenEdgeColor", { view: "color" })
		.on("change", (e) => effect.hiddenEdgeColor.setHex(e.value).convertSRGBToLinear());
	folder.addInput(effect, "xRay");
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
		animationMixer.update(pipeline.timer.delta * 1e-3);
		pipeline.render(timestamp);
		requestAnimationFrame(render);

	});

}));
