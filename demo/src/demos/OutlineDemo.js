import {
  Vector2,
  AmbientLight,
  SphereBufferGeometry,
  PlaneBufferGeometry,
  TorusBufferGeometry,
  DirectionalLight,
  Group,
  Mesh,
  MeshPhongMaterial,
  OrbitControls,
  RepeatWrapping,
  TextureLoader,
  DoubleSide,
  Raycaster
} from "three";

import { RenderPass, OutlinePass, ShaderPass, CopyMaterial } from "../../../src";
import { Demo } from "./Demo.js";

/**
 * PI times two.
 *
 * @type {Number}
 * @private
 */

const TWO_PI = 2.0 * Math.PI;

const raycaster = new Raycaster();

/**
 * A render demo setup.
 */

export class OutlineDemo extends Demo {

  /**
   * Constructs a new render demo.
   *
   * @param {EffectComposer} composer - An effect composer.
   */

  constructor(composer) {

    super(composer);

    /**
     * An object.
     *
     * @type {Object3D}
     * @private
     */

    this.object = new Group();

    /**
     * Should the scene rotate
     *
     * @type {Boolean}
     * @private
     */

    this.rotate = false;

    /**
     * The normalized mouse coordinates
     *
     * @type {Vector2}
     * @private
     */
    this.mouse = new Vector2();

  }

  /**
   * Loads scene assets.
   *
   * @param {Function} callback - A callback function.
   */

  load(callback) {

    const loader = new TextureLoader();
    loader.load("textures/tripattern.jpg", (texture) => {
      texture.wrapS = RepeatWrapping;
      texture.wrapT = RepeatWrapping;

      this.patternTexture = texture;

      callback();
    });

  }

  /**
   * Creates the scene.
   */

  initialise() {

    const scene = this.scene;
    const camera = this.camera;
    const composer = this.composer;

    // Controls.

    this.controls = new OrbitControls(camera, composer.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.25;

    this.onTouchMove = this.onTouchMove.bind(this);
    window.addEventListener("mousemove", this.onTouchMove);
    window.addEventListener("touchmove", this.onTouchMove);

    // Camera.

    camera.position.set(0, 0, 8);
    camera.lookAt(this.controls.target);

    // Lights.

    const ambientLight = new AmbientLight(0xAAAAAA, 0.2);
    scene.add(ambientLight);

    const light1 = new DirectionalLight(0xDDFFDD, 0.4);
    light1.position.set(1, 1, 1);
    scene.add(light1);

    const light2 = new DirectionalLight(0xAADDDD, 0.15);
    light2.position.set(-1, -1, 1);
    scene.add(light2);

    const light3 = new DirectionalLight(0xDDDDAA, 0.1);
    light3.position.set(-1, 1, 1);
    scene.add(light3);

    // Objects.

    const geometry = new SphereBufferGeometry(3, 48, 24);
    for(let i = 0; i < 20; i++) {

      const material = new MeshPhongMaterial();
      material.color.setHSL(Math.random(), 1.0, 0.3);

      const mesh = new Mesh(geometry, material);
      mesh.position.set(
        (Math.random() * 4) - 2,
        (Math.random() * 4) - 2,
        (Math.random() * 4) - 2
      );
      mesh.scale.multiplyScalar(Math.random() * 0.3 + 0.1);

      this.object.add(mesh);
    }

    const floorGeometry = new PlaneBufferGeometry(12, 12);
    const floorMaterial = new MeshPhongMaterial({
      side: DoubleSide
    });

    const floorMesh = new Mesh(floorGeometry, floorMaterial);
    floorMesh.position.y -= 1.5;
    floorMesh.rotation.x -= (Math.PI * 0.5);

    this.object.add(floorMesh);

    const torusGeometry = new TorusBufferGeometry(1, 0.3, 16, 100);
    const torusMaterial = new MeshPhongMaterial({ color: 0xffaaff });

    const torus = new Mesh(torusGeometry, torusMaterial);
    torus.position.z = -4;

    this.object.add(torus);

    scene.add(this.object);

    // Passes.

    const renderPass = new RenderPass(scene, camera);
    composer.addPass(renderPass);

    this.outlinePass = new OutlinePass(
      { x: window.innerWidth, y: window.innerHeight },
      scene,
      camera
    );
    this.outlinePass.patternTexture = this.patternTexture;
    composer.addPass(this.outlinePass);

    const copyPass = new ShaderPass(new CopyMaterial());
    copyPass.renderToScreen = true;
    composer.addPass(copyPass);

  }

  /**
   * Updates this demo.
   *
   * @param {Number} delta - The time since the last frame in seconds.
   */

  update(delta) {
    const object = this.object;

    if(object !== null && this.rotate) {

      object.rotation.y += 0.01;

      // Prevent overflow.
      if(object.rotation.y >= TWO_PI) { object.rotation.y -= TWO_PI; }

    }
  }

  configure(gui) {

    gui.add(this.outlinePass, "edgeStrength", 0.01, 10);

    gui.add(this.outlinePass, "edgeGlow", 0.0, 1);

    gui.add(this.outlinePass, "edgeThickness", 1, 4);

    gui.add(this.outlinePass, "pulsePeriod", 0.0, 5);

    gui.add(this, "rotate");

    gui.add(this.outlinePass, "usePatternTexture");

    const colorParams = {
      visibleEdgeColor: "#FFFFFF",
      hiddenEdgeColor: "#190105"
    };

    gui.addColor(colorParams, "visibleEdgeColor").onChange((val) => {
      this.outlinePass.visibleEdgeColor.set(val);
    });

    gui.addColor(colorParams, "hiddenEdgeColor").onChange((val) => {
      this.outlinePass.hiddenEdgeColor.set(val);
    });

  }

  onTouchMove(e) {
    let x, y;

    if(e.changedTouches) {

      x = e.changedTouches[0].pageX;
      y = e.changedTouches[0].pageY;

    } else {

      x = e.clientX;
      y = e.clientY;

    }

    this.mouse.x = ((x / window.innerWidth) * 2) - 1;
    this.mouse.y = 1 - ((y / window.innerHeight) * 2);

    raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = raycaster.intersectObjects(this.scene.children, true);

    if(intersects.length > 0) {
      this.outlinePass.selectedObjects = [intersects[0].object];
    } else {
      this.outlinePass.selectedObjects = [];
    }
  }
}
