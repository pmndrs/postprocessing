import {
	ClampToEdgeWrapping,
	LinearFilter,
	LoadingManager,
	Mesh,
	MeshBasicMaterial,
	PerspectiveCamera,
	PlaneGeometry,
	Scene,
	SRGBColorSpace,
	TextureLoader,
	Texture,
	WebGLRenderer
} from "three";

import {
	ClearPass,
	EffectPass,
	GeometryPass,
	LookupTexture,
	LUT3DEffect,
	MixBlendFunction,
	RawImageData,
	RenderPipeline
} from "postprocessing";

import { LUT3dlLoader } from "three/examples/jsm/loaders/LUT3dlLoader.js";
import { LUTCubeLoader } from "three/examples/jsm/loaders/LUTCubeLoader.js";
import { Pane } from "tweakpane";
import { ControlMode, SpatialControls } from "spatial-controls";
import * as Utils from "../utils/index.js";

const luts = new Map<string, string | null>([
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
	["3dl/sepia", "3dl/sepia.3dl"],
	["3dl/cinematic", "3dl/presetpro-cinematic.3dl"],
	["cube/cinematic", "cube/presetpro-cinematic.cube"],
	["cube/django-25", "cube/django-25.cube"]
]);

function load(): Promise<Map<string, Texture | LookupTexture>> {

	const assets = new Map<string, Texture | LookupTexture>();
	const loadingManager = new LoadingManager();
	const textureLoader = new TextureLoader(loadingManager);
	const lut3dlLoader = new LUT3dlLoader(loadingManager);
	const lutCubeLoader = new LUTCubeLoader(loadingManager);

	const lutNeutral2 = LookupTexture.createNeutral(2);
	lutNeutral2.name = "neutral-2";
	assets.set(lutNeutral2.name, lutNeutral2);

	const lutNeutral4 = LookupTexture.createNeutral(4);
	lutNeutral4.name = "neutral-4";
	assets.set(lutNeutral4.name, lutNeutral4);

	const lutNeutral8 = LookupTexture.createNeutral(8);
	lutNeutral8.name = "neutral-8";
	assets.set(lutNeutral8.name, lutNeutral8);

	return new Promise<Map<string, Texture | LookupTexture>>((resolve, reject) => {

		loadingManager.onLoad = () => resolve(assets);
		loadingManager.onError = (url) => reject(new Error(`Failed to load ${url}`));

		textureLoader.load(`${document.baseURI}img/textures/photos/GEDC0053.jpg`, (t) => {

			t.colorSpace = SRGBColorSpace;
			assets.set("photo", t);

		});

		for(const entry of luts) {

			if(entry[1] === null) {

				continue;

			} else if(/.3dl$/im.test(entry[1])) {

				lut3dlLoader.load(`${document.baseURI}img/textures/lut/${entry[1]}`, (data) => {

					const t = LookupTexture.from(data.texture3D);
					t.name = entry[0];
					assets.set(entry[0], t);

				});

			} else if(/.cube$/im.test(entry[1])) {

				lutCubeLoader.load(`${document.baseURI}img/textures/lut/${entry[1]}`, (data) => {

					const t = LookupTexture.from(data.texture3D);
					t.name = entry[0];
					assets.set(entry[0], t);

				});

			} else {

				textureLoader.load(`${document.baseURI}img/textures/lut/${entry[1]}`, (t) => {

					t.name = entry[0];
					t.generateMipmaps = false;
					t.minFilter = LinearFilter;
					t.magFilter = LinearFilter;
					t.wrapS = ClampToEdgeWrapping;
					t.wrapT = ClampToEdgeWrapping;
					t.flipY = false;
					assets.set(entry[0], LookupTexture.from(t));

				});

			}

		}

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
	renderer.setClearAlpha(0);

	// Camera & Controls

	const camera = new PerspectiveCamera();
	const controls = new SpatialControls(camera.position, camera.quaternion, renderer.domElement);
	const settings = controls.settings;
	settings.general.mode = ControlMode.THIRD_PERSON;
	settings.zoom.sensitivity = 0.05;
	settings.zoom.damping = 0.1;
	settings.rotation.sensitivity = 0;
	settings.translation.enabled = false;
	controls.position.set(0, 0, 1.4);

	// Scene & Objects

	const scene = new Scene();
	const mesh = new Mesh(
		new PlaneGeometry(),
		new MeshBasicMaterial({
			map: assets.get("photo") as Texture
		})
	);

	mesh.scale.x = 2;
	scene.add(mesh);

	// LUT Preview

	const container = document.getElementById("viewport")!;
	const img = document.createElement("img");
	img.title = "This is a compressed preview image";
	img.classList.add("lut", "hidden");
	container.append(img);

	// Post Processing

	const lut = assets.get("png/filmic1") as LookupTexture;
	const effect = new LUT3DEffect({ lut });
	effect.blendMode.blendFunction = new MixBlendFunction();

	const pipeline = new RenderPipeline(renderer);
	pipeline.add(
		new ClearPass(),
		new GeometryPass(scene, camera),
		new EffectPass(effect)
	);

	// Settings

	const pane = new Pane({ container: container.querySelector<HTMLElement>(".tp")! });
	const fpsGraph = Utils.createFPSGraph(pane);

	const params = {
		"lut": effect.lut!.name,
		"3D texture": true,
		"base size": effect.lut!.image.width,
		"scale up": false,
		"target size": 48
	};

	let objectURL = null;

	function updateLUTPreview() {

		const image = effect.lut!.clone().convertToUint8().toDataTexture().image as ImageData;
		RawImageData.from(image).toCanvas().toBlob((blob) => {

			if(blob !== null) {

				objectURL = URL.createObjectURL(blob);
				img.src = objectURL;
				img.classList.remove("hidden");

			}

		});

	}

	updateLUTPreview();

	function changeLUT(): void {

		const original = assets.get(params.lut) as LookupTexture;
		const size = Math.min(original.image.width, original.image.height);
		const scaleUp = params["scale up"] && (params["target size"] > size);

		let promise;

		if(scaleUp) {

			console.time("Tetrahedral Upscaling");
			promise = original.scaleUp(params["target size"], false);
			document.body.classList.add("progress");

		} else {

			promise = Promise.resolve(original.clone());

		}

		promise.then((lut) => {

			if(scaleUp) {

				console.timeEnd("Tetrahedral Upscaling");
				document.body.classList.remove("progress");

			}

			effect.lut!.dispose();
			params["base size"] = size;

			if(renderer.getContext().getExtension("OES_texture_float_linear") === null) {

				console.log("Linear float filtering not supported, converting to Uint8");
				lut.convertToUint8();

			}

			effect.lut = lut;
			updateLUTPreview();

		}).catch((error) => console.error(error));

	}

	const folder = pane.addFolder({ title: "Settings" });
	folder.addBinding(params, "lut", { options: Utils.arrayToRecord([...luts.keys()]) }).on("change", changeLUT);
	folder.addBinding(effect, "tetrahedralInterpolation");
	folder.addBinding(params, "base size", { readonly: true, format: (v) => v.toFixed(0) });
	folder.addBinding(params, "scale up").on("change", changeLUT);
	folder.addBinding(params, "target size", { options: Utils.arrayToRecord([32, 48, 64, 128]) }).on("change", changeLUT);

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
