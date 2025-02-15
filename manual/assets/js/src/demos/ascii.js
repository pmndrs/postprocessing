import {
    CubeTextureLoader,
    FogExp2,
    LoadingManager,
    PerspectiveCamera,
    Scene,
    SRGBColorSpace,
    WebGLRenderer
} from "three";

import {
    AsciiEffect,
    EffectComposer,
    EffectPass,
    RenderPass
} from "postprocessing";

import { Pane } from "tweakpane";
import { SpatialControls } from "spatial-controls";
import { calculateVerticalFoV, FPSMeter } from "../utils";
import * as Domain from "../objects/Domain";

function load() {

    const assets = new Map();
    const loadingManager = new LoadingManager();
    const cubeTextureLoader = new CubeTextureLoader(loadingManager);

    const path = document.baseURI + "img/textures/skies/sunset/";
    const format = ".png";
    const urls = [
        path + "px" + format, path + "nx" + format,
        path + "py" + format, path + "ny" + format,
        path + "pz" + format, path + "nz" + format
    ];

    return new Promise((resolve, reject) => {

        loadingManager.onLoad = () => resolve(assets);
        loadingManager.onError = (url) => reject(new Error(`Failed to load ${url}`));

        cubeTextureLoader.load(urls, (t) => {

            t.colorSpace = SRGBColorSpace;
            assets.set("sky", t);

        });

    });

}

window.addEventListener("load", () => load().then((assets) => {

    // Renderer

    const renderer = new WebGLRenderer({
        powerPreference: "high-performance",
        antialias: false,
        stencil: false,
        depth: false
    });

    renderer.debug.checkShaderErrors = (window.location.hostname === "localhost");
    const container = document.querySelector(".viewport");
    container.prepend(renderer.domElement);

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
    scene.fog = new FogExp2(0x373134, 0.06);
    scene.background = assets.get("sky");
    scene.add(Domain.createLights());

    // Post Processing

    const composer = new EffectComposer(renderer);

    const effect = new AsciiEffect({
        font: "arial",
        characters: ` .:,'-^=*+?!|0#X%WM@`,
        fontSize: 35,
        cellSize: 16,
        color: "#ffffff",
        invert: false
    });
    composer.addPass(new RenderPass(scene, camera));
    composer.addPass(new EffectPass(camera, effect));

    // Settings

    const fpsMeter = new FPSMeter();
    const pane = new Pane({ container: container.querySelector(".tp") });
    pane.addBinding(fpsMeter, "fps", { readonly: true, label: "FPS" });

    const folder = pane.addFolder({ title: "Settings" });
    // folder.addBinding(effect, "granularity", { min: 0, max: 20, step: 1 });


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

}));
