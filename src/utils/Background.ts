import {
	BoxGeometry,
	Camera,
	CubeTexture,
	CubeUVReflectionMapping,
	Euler,
	Group,
	Matrix3,
	Matrix4,
	Mesh,
	PlaneGeometry,
	Scene,
	Texture,
	Uniform,
	WebGLProgramParametersWithUniforms,
	WebGLRenderer
} from "three";

import { Disposable } from "../core/Disposable.js";
import { BackgroundMaterial } from "../materials/BackgroundMaterial.js";
import { SkyBoxMaterial } from "../materials/SkyBoxMaterial.js";
import { ClearValues } from "./ClearValues.js";
import { extractOutputDefinitions } from "./GBufferUtils.js";

const euler = /* @__PURE__ */ new Euler();
const matrix4 = /* @__PURE__ */ new Matrix4();

/**
 * A background that supports normal textures and cube textures.
 *
 * @category Utils
 * @internal
 */

export class Background extends Group implements Disposable {

	/**
	 * A sky box.
	 */

	private skyBox: Mesh<BoxGeometry, SkyBoxMaterial>;

	/**
	 * A background plane.
	 */

	private background: Mesh<PlaneGeometry, BackgroundMaterial>;

	/**
	 * Constructs a new background.
	 */

	constructor() {

		super();

		const skyBox = new Mesh(new BoxGeometry(1, 1, 1), new SkyBoxMaterial());
		skyBox.name = "SkyBox";
		skyBox.geometry.deleteAttribute("normal");
		skyBox.geometry.deleteAttribute("uv");
		skyBox.matrixAutoUpdate = false;
		skyBox.frustumCulled = false;
		skyBox.layers.enableAll();
		this.skyBox = skyBox;

		skyBox.onBeforeRender = function(_renderer: WebGLRenderer, _scene: Scene, camera: Camera): void {

			this.matrixWorld.copyPosition(camera.matrixWorld);

		};

		const background = new Mesh(new PlaneGeometry(2, 2), new BackgroundMaterial());
		background.name = "Background";
		background.geometry.deleteAttribute("normal");
		background.matrixAutoUpdate = false;
		background.frustumCulled = false;
		background.layers.enableAll();
		this.background = background;

		this.add(this.skyBox, this.background);

	}

	/**
	 * Creates uniforms for the background materials using the given clear values.
	 *
	 * @param values - Clear values.
	 */

	setClearValues(values: ClearValues): void {

		const skyBoxMaterial = new SkyBoxMaterial();
		const backgroundMaterial = new BackgroundMaterial();

		const uniforms = new Map<string, Uniform>();
		const uniformDeclarations: string[] = [];
		const mrtWrites: string[] = [];

		for(const entry of values.gBuffer) {

			uniforms.set(`pp_${entry[0]}`, new Uniform(entry[1]));
			uniformDeclarations.push(`uniform vec${entry[1].toArray().length} pp_${entry[0]};`);
			mrtWrites.push(`\t#ifdef out_${entry[0]}\n\t\tout_${entry[0]} = pp_${entry[0]};\n#endif`);

		}

		const shaderCodeHead = uniformDeclarations.join("\n");
		const shaderCodeBody = mrtWrites.join("\n");

		for(const material of [skyBoxMaterial, backgroundMaterial]) {

			material.fragmentShader = material.fragmentShader.replace(
				/(void main\(\) {)/,
				`${shaderCodeHead}\n$1\n${shaderCodeBody}\n`
			);

			for(const entry of uniforms) {

				material.uniforms[entry[0]] = entry[1];

			}

			// @todo Remove when three support auto shader outputs.
			material.onBeforeCompile = (shader: WebGLProgramParametersWithUniforms, renderer: WebGLRenderer) => {

				const renderTarget = renderer.getRenderTarget();

				if(renderTarget === null) {

					return;

				}

				const outputDefinitions = extractOutputDefinitions(renderTarget);
				shader.fragmentShader = outputDefinitions + "\n\n" + shader.fragmentShader;

			};

		}

		this.skyBox.material.dispose();
		this.background.material.dispose();

		this.skyBox.material = skyBoxMaterial;
		this.background.material = backgroundMaterial;

	}

	/**
	 * Updates the background based on the background settings of a given scene.
	 *
	 * @param scene - A scene.
	 */

	update(scene: Scene | null): void {

		const { skyBox, background } = this;

		skyBox.visible = false;
		background.visible = false;

		if(scene === null || !(scene.background instanceof Texture)) {

			return;

		}

		if(scene.background instanceof CubeTexture || scene.background.mapping === CubeUVReflectionMapping) {

			const flipEnvMap = scene.background.isRenderTargetTexture ? 1 : -1;
			euler.copy(scene.backgroundRotation);
			euler.x *= -1; euler.y *= -1; euler.z *= -1;
			euler.y *= flipEnvMap; euler.z *= flipEnvMap;

			skyBox.material.envMap = scene.background;
			skyBox.material.uniforms.flipEnvMap.value = flipEnvMap;
			skyBox.material.uniforms.backgroundBlurriness.value = scene.backgroundBlurriness;
			skyBox.material.uniforms.backgroundIntensity.value = scene.backgroundIntensity;
			const backgroundRotation = skyBox.material.uniforms.backgroundRotation.value as Matrix3;
			backgroundRotation.setFromMatrix4(matrix4.makeRotationFromEuler(euler));
			skyBox.visible = true;

		} else {

			background.material.map = scene.background;
			background.material.uniforms.backgroundIntensity.value = scene.backgroundIntensity;
			background.visible = true;

		}

	}

	dispose(): void {

		this.skyBox.material.dispose();
		this.background.material.dispose();

	}

}
