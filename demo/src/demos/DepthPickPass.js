import {
	RGBADepthPacking,
	FloatType,
	NearestFilter,
	UnsignedByteType,
	WebGLRenderTarget,
	Vector3,
	Raycaster
} from "three";

import { Pass } from "../../../src/passes/Pass";
import { DepthPickMaterial } from "./DepthPickMaterial";

const UnpackDownscale = 255 / 256;

const PackFactorsX = 256 * 256 * 256, PackFactorsY = 256 * 256, PackFactorsZ = 256;
const
	UnpackFactorsX = UnpackDownscale / PackFactorsX,
	UnpackFactorsY = UnpackDownscale / PackFactorsY,
	UnpackFactorsZ = UnpackDownscale / PackFactorsZ;

function unpackRGBAToDepth(v) {

	return (v[0] * UnpackFactorsX + v[1] * UnpackFactorsY + v[2] * UnpackFactorsZ + v[3]) / 256;

}

export class DepthPickPass extends Pass {

	constructor(camera, depthPacking = RGBADepthPacking) {

		super("DepthPickPass");

		const material = new DepthPickMaterial();
		material.outputDepthPacking = depthPacking;
		this.material = material;
		this.setFullscreenMaterial(material);
		this.needsDepthTexture = true;
		this.needsSwap = false;
		this.sceneCamera = camera;

		this.renderTarget = new WebGLRenderTarget(2, 2, {
			// use RGBADepthPacking by default to get higher resolution on mobile devices.
			type: depthPacking === RGBADepthPacking ? UnsignedByteType : FloatType,
			minFilter: NearestFilter,
			magFilter: NearestFilter,
			stencilBuffer: false,
			depthBuffer: false
		});

		this.renderTarget.texture.name = "DepthPickPass.Target";

		// this.near = this.sceneCamera.projectionMatrix.elements[14] / (this.sceneCamera.projectionMatrix.elements[10] - 1.0);
		// this.far = this.sceneCamera.projectionMatrix.elements[14] / (this.sceneCamera.projectionMatrix.elements[10] + 1.0);
		// console.log("nearfar", this.near, this.far);

		window.depthPickPass = this;

	}

	set position(value) {

		this.material.position = value;

	}

	get texture() {

		return this.renderTarget.texture;

	}

	get depthPacking() {

		return this.getFullscreenMaterial().outputDepthPacking;

	}

	setDepthTexture(depthTexture, depthPacking = 0) {

		const material = this.getFullscreenMaterial();
		material.uniforms.depthBuffer.value = depthTexture;
		material.inputDepthPacking = depthPacking;

	}

	render(renderer, inputBuffer, outputBuffer, deltaTime, stencilTest) {

		renderer.setRenderTarget(this.renderToScreen ? null : this.renderTarget);
		renderer.render(this.scene, this.camera);

		const pixelBuffer = new Uint8Array(4);
		renderer.readRenderTargetPixels(this.renderTarget, 1, 1, 1, 1, pixelBuffer);

		console.debug(pixelBuffer, this.material.uniforms.vUv.value);

	}

	// do nothing to keep the render buffer 1x1
	setSize(width, height) { }

}

