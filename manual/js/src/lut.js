import {
	ClampToEdgeWrapping,
	CubeTextureLoader,
	HalfFloatType,
	LinearFilter,
	LoadingManager,
	PerspectiveCamera,
	RGBFormat,
	Scene,
	sRGBEncoding,
	TextureLoader,
	VSMShadowMap,
	WebGLRenderer
} from "three";

import {
	BlendFunction,
	LUTEffect,
	EffectComposer,
	EffectPass,
	LookupTexture3D,
	LUT3dlLoader,
	LUTCubeLoader,
	RawImageData,
	RenderPass
} from "../../../src";

import { Pane } from "tweakpane";
import { ControlMode, SpatialControls } from "spatial-controls";
import { calculateVerticalFoV, FPSMeter } from "./utils";
import * as CornellBox from "./objects/CornellBox";

const luts = new Map([
	["neutral-2", null],
	["neutral-4", null],
	["neutral-8", null],
	["png/bleach-bypass", "png/bleach-bypass.png"],
	["png/candle-light", "png/candle-light.png"],
	["png/cool-contrast", "png/cool-contrast.png"],
	["png/warm-contrast", "png/warm-contrast.png"],
	["png/desaturated-fog", "png/desaturated-fog.png"],
	["png/evening", "png/evening.png"],
	["png/fall", "png/fall.png"],
	["png/filmic1", "png/filmic1.png"],
	["png/filmic2", "png/filmic2.png"],
	["png/matrix-green", "png/matrix-green.png"],
	["png/strong-amber", "png/strong-amber.png"],
	["3dl/cinematic", "3dl/presetpro-cinematic.3dl"],
	["cube/cinematic", "cube/presetpro-cinematic.cube"],
	["cube/django-25", "cube/django-25.cube"]
]);

function load() {

	const assets = new Map();
	const loadingManager = new LoadingManager();
	const cubeTextureLoader = new CubeTextureLoader(loadingManager);
	const textureLoader = new TextureLoader(loadingManager);
	const lut3dlLoader = new LUT3dlLoader(loadingManager);
	const lutCubeLoader = new LUTCubeLoader(loadingManager);

	const path = "/img/textures/skies/sunset/";
	const format = ".png";
	const urls = [
		path + "px" + format, path + "nx" + format,
		path + "py" + format, path + "ny" + format,
		path + "pz" + format, path + "nz" + format
	];

	const lutNeutral2 = LookupTexture3D.createNeutral(2);
	lutNeutral2.name = "neutral-2";
	assets.set(lutNeutral2.name, lutNeutral2);

	const lutNeutral4 = LookupTexture3D.createNeutral(4);
	lutNeutral4.name = "neutral-4";
	assets.set(lutNeutral4.name, lutNeutral4);

	const lutNeutral8 = LookupTexture3D.createNeutral(8);
	lutNeutral8.name = "neutral-8";
	assets.set(lutNeutral8.name, lutNeutral8);

	return new Promise((resolve, reject) => {

		loadingManager.onLoad = () => resolve(assets);
		loadingManager.onError = (url) => reject(`Failed to load ${url}`);

		cubeTextureLoader.load(urls, (t) => {

			t.encoding = sRGBEncoding;
			assets.set("sky", t);

		});

		for(const entry of luts) {

			if(entry[1] === null) {

				continue;

			} else if(/.3dl$/im.test(entry[1])) {

				lut3dlLoader.load(`/img/textures/lut/${entry[1]}`, (t) => {

					t.name = entry[0];
					assets.set(entry[0], t);

				});

			} else if(/.cube$/im.test(entry[1])) {

				lutCubeLoader.load(`/img/textures/lut/${entry[1]}`, (t) => {

					t.name = entry[0];
					assets.set(entry[0], t);

				});

			} else {

				textureLoader.load(`/img/textures/lut/${entry[1]}`, (t) => {

					t.name = entry[0];
					t.format = RGBFormat;
					t.encoding = sRGBEncoding;
					t.generateMipmaps = false;
					t.minFilter = LinearFilter;
					t.magFilter = LinearFilter;
					t.wrapS = ClampToEdgeWrapping;
					t.wrapT = ClampToEdgeWrapping;
					t.unpackAlignment = 1;
					t.flipY = false;

					assets.set(entry[0], t);

				});

			}

		}

	});

}

function initialize(assets) {

	// Renderer

	const renderer = new WebGLRenderer({
		powerPreference: "high-performance",
		antialias: false,
		stencil: false,
		depth: false,
		alpha: false
	});

	const container = document.querySelector(".viewport");
	container.append(renderer.domElement);
	renderer.debug.checkShaderErrors = (window.location.hostname === "localhost");
	renderer.setSize(container.clientWidth, container.clientHeight);
	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.outputEncoding = sRGBEncoding;
	renderer.setClearColor(0x000000, 1);
	renderer.physicallyCorrectLights = true;
	renderer.shadowMap.type = VSMShadowMap;
	renderer.shadowMap.autoUpdate = false;
	renderer.shadowMap.needsUpdate = true;
	renderer.shadowMap.enabled = true;

	// Camera & Controls

	const camera = new PerspectiveCamera();
	const controls = new SpatialControls(camera.position, camera.quaternion, renderer.domElement);
	const settings = controls.settings;
	settings.general.setMode(ControlMode.THIRD_PERSON);
	settings.rotation.setSensitivity(2.2);
	settings.rotation.setDamping(0.05);
	settings.zoom.setDamping(0.1);
	settings.translation.setEnabled(false);
	controls.setPosition(0, 0, 5);

	// Scene, Lights, Objects

	const scene = new Scene();
	scene.background = assets.get("sky");
	scene.add(...CornellBox.createLights());
	scene.add(CornellBox.createEnvironment());
	scene.add(CornellBox.createActors());

	// LUT Preview

	const img = document.createElement("img");
	img.title = "This is a compressed preview image";
	img.classList.add("lut", "hidden");
	container.append(img);

	// Post Processing

	const context = renderer.getContext();
	const composer = new EffectComposer(renderer, {
		multisampling: Math.min(4, context.getParameter(context.MAX_SAMPLES)),
		frameBufferType: HalfFloatType
	});

	const lut = LookupTexture3D.from(assets.get("png/filmic1"));
	const lutEffect = renderer.capabilities.isWebGL2 ? new LUTEffect(lut) :
		new LUTEffect(lut.convertToUint8().toDataTexture());

	composer.addPass(new RenderPass(scene, camera));
	composer.addPass(new EffectPass(camera, lutEffect));

	// Settings

	const fpsMeter = new FPSMeter();
	const pane = new Pane({ container: container.querySelector(".tp") });
	pane.addMonitor(fpsMeter, "fps", { label: "FPS" });
	pane.addSeparator();

	const params = {
		"lut": lutEffect.getLUT().name,
		"base size": lutEffect.getLUT().image.width,
		"3D texture": true,
		"tetrahedral filter": false,
		"scale up": false,
		"target size": 48,
		"show LUT": false,
		"opacity": lutEffect.blendMode.opacity.value,
		"blend mode": lutEffect.blendMode.blendFunction
	};

	let objectURL = null;

	function updateLUTPreview() {

		if(params["show LUT"]) {

			const lut = LookupTexture3D.from(lutEffect.getLUT());
			const { image } = lut.convertToUint8().convertToRGBA().toDataTexture();
			RawImageData.from(image).toCanvas().toBlob((blob) => {

				objectURL = URL.createObjectURL(blob);
				img.src = objectURL;
				img.classList.remove("hidden");

			});

		} else {

			img.classList.add("hidden");

		}

	}

	function changeLUT() {

		const original = assets.get(params.lut);
		const size = Math.min(original.image.width, original.image.height);
		const targetSize = params["target size"];
		const scaleUp = params["scale up"] && (targetSize > size);

		let promise;

		if(scaleUp) {

			const lut = original.isLookupTexture3D ? original : LookupTexture3D.from(original);
			console.time("Tetrahedral Upscaling");
			promise = lut.scaleUp(targetSize, false);
			document.body.classList.add("progress");

		} else {

			promise = Promise.resolve(LookupTexture3D.from(original));

		}

		promise.then((lut) => {

			if(scaleUp) {

				console.timeEnd("Tetrahedral Upscaling");
				document.body.classList.remove("progress");

			}

			lutEffect.getLUT().dispose();
			params["base size"] = size;

			if(renderer.capabilities.isWebGL2) {

				if(context.getExtension("OES_texture_float_linear") === null) {

					console.log("Linear float filtering not supported, converting to Uint8");
					lut.convertToUint8();

				}

				lutEffect.setLUT(params["3D texture"] ? lut : lut.toDataTexture());

			} else {

				lutEffect.setLUT(lut.convertToUint8().toDataTexture());

			}

			updateLUTPreview();

		}).catch((error) => console.error(error));

	}

	function reducer(a, b) {

		a[b] = b;
		return a;

	}

	pane.addInput(params, "lut", { options: [...luts.keys()].reduce(reducer, {}) }).on("change", changeLUT);

	if(renderer.capabilities.isWebGL2) {

		pane.addInput(params, "3D texture").on("change", changeLUT);
		pane.addInput(params, "tetrahedral filter")
			.on("change", (e) => lutEffect.setTetrahedralInterpolationEnabled(e.value));

	}

	pane.addInput(params, "show LUT").on("change", updateLUTPreview);
	pane.addInput(params, "scale up").on("change", changeLUT);
	pane.addInput(params, "target size", { options: [32, 48, 64, 96, 128].reduce(reducer, {}) }).on("change", changeLUT);

	pane.addInput(lutEffect.blendMode.opacity, "value", { label: "opacity", min: 0, max: 1, step: 0.01 });
	pane.addInput(lutEffect.blendMode, "blendFunction", { label: "blend mode", options: BlendFunction })
		.on("change", (e) => lutEffect.blendMode.setBlendFunction(e.value));

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

}

window.addEventListener("load", () => load().then(initialize).catch((e) => {

	const container = document.querySelector(".viewport");
	const message = document.createElement("p");
	message.classList.add("error");
	message.innerText = e.toString();
	container.append(message);
	console.error(e);

}));
