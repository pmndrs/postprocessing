import {
	BasicDepthPacking,
	FloatType,
	NearestFilter,
	UnsignedByteType,
	WebGLRenderTarget
} from "three";

import { Pass } from "../../../src/passes/Pass";
import { DepthCopyMaterial } from "./DepthCopyMaterial";

const UnpackDownscale = 255 / 256;

const PackFactorsX = 256 * 256 * 256, PackFactorsY = 256 * 256, PackFactorsZ = 256;
const
	UnpackFactorsX = UnpackDownscale / PackFactorsX,
	UnpackFactorsY = UnpackDownscale / PackFactorsY,
	UnpackFactorsZ = UnpackDownscale / PackFactorsZ;

function unpackRGBAToDepth(v) {

	return v[0] * UnpackFactorsX + v[1] * UnpackFactorsY + v[2] * UnpackFactorsZ + v[3];

}

export class DepthSavePass extends Pass {

	constructor(depthPacking = BasicDepthPacking) {

		super("DepthSavePass");

		const material = new DepthCopyMaterial();
		material.outputDepthPacking = depthPacking;
		this.setFullscreenMaterial(material);
		this.needsDepthTexture = true;
		this.needsSwap = false;

		this.renderTarget = new WebGLRenderTarget(1, 1, {
			type: depthPacking === BasicDepthPacking ? FloatType : UnsignedByteType,
			minFilter: NearestFilter,
			magFilter: NearestFilter,
			stencilBuffer: false,
			depthBuffer: false
		});

		this.renderTarget.texture.name = "DepthSavePass.Target";

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
		renderer.readRenderTargetPixels(this.renderTarget, 0, 0, 1, 1, pixelBuffer);

		console.log(pixelBuffer, unpackRGBAToDepth(pixelBuffer));

	}

	setSize(width, height) {

		this.renderTarget.setSize(width, height);

	}

}
