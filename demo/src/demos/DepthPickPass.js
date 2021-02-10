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

	constructor(camera, cb, depthPacking = RGBADepthPacking) {

		super("DepthPickPass");

		const material = new DepthPickMaterial();
		material.outputDepthPacking = depthPacking;
		this.material = material;
		this.setFullscreenMaterial(material);
		this.needsDepthTexture = true;
		this.needsSwap = false;

		this.renderTarget = new WebGLRenderTarget(2, 2, {
			// use RGBADepthPacking by default to get higher resolution on mobile devices.
			type: depthPacking === RGBADepthPacking ? UnsignedByteType : FloatType,
			minFilter: NearestFilter,
			magFilter: NearestFilter,
			stencilBuffer: false,
			depthBuffer: false
		});

		this.renderTarget.texture.name = "DepthPickPass.Target";

		window.depthPickPass = this;

		this.gpuRaycastCB = cb;
		this.sceneCamera = camera;

	}

	set position(value) {

		// perform the conversion from NDC to texcoord space
		this.material.position = value.multiplyScalar(0.5).addScalar(.5);
		this.receivedPosition = true;

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

		if(this.receivedPosition) {

			renderer.setRenderTarget(this.renderToScreen ? null : this.renderTarget);
			renderer.render(this.scene, this.camera);

			const pixelBuffer = new Uint8Array(4);
			renderer.readRenderTargetPixels(this.renderTarget, 1, 1, 1, 1, pixelBuffer);
			const z = unpackRGBAToDepth(pixelBuffer);

			// values we have need to be converted from the 0-1 cube (texcoord, texcoord, depth) back to 
			// NDC space in preparation for camera unproject to obtain world space intersection position.
			const world = new Vector3(this.material.uniforms.vUv.value.x, this.material.uniforms.vUv.value.y, z).multiplyScalar(2).subScalar(1).unproject(this.sceneCamera);

			this.gpuRaycastCB(world);

		}

	}

	// do nothing to keep the render buffer 1x1
	setSize(width, height) { }

}

