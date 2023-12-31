import {
	AmbientLight,
	Group,
	LinearFilter,
	LinearMipMapLinearFilter,
	Mesh,
	MeshStandardMaterial,
	PlaneGeometry,
	RepeatWrapping,
	SRGBColorSpace,
	Texture
} from "three";

import { alphaFog } from "../utils/alphaFog.js";
import { checkerboardImageDataURL } from "./checkerboardImageDataURL.js";

/**
 * Creates lights.
 *
 * @return The lights.
 */

export function createLights(): Group {

	const lights = new Group();
	const ambientLight = new AmbientLight(0xffffff);
	lights.add(ambientLight);

	return lights;

}

/**
 * Creates the environment.
 *
 * @return The mesh.
 */

export function createEnvironment(): Group {

	const planeSize = 5000;
	const image = new Image();
	const map = new Texture(image);
	map.generateMipmaps = true;
	map.minFilter = LinearMipMapLinearFilter;
	map.magFilter = LinearFilter;
	map.wrapS = RepeatWrapping;
	map.wrapT = RepeatWrapping;
	map.colorSpace = SRGBColorSpace;
	map.repeat.setScalar(planeSize / 2);
	map.anisotropy = 4;

	image.addEventListener("load", () => map.needsUpdate = true);
	image.src = checkerboardImageDataURL;

	const group = new Group();
	const material = new MeshStandardMaterial({
		transparent: true,
		roughness: 0.1,
		metalness: 1,
		map
	});

	const checkerboard = new Mesh(new PlaneGeometry(planeSize, planeSize, 6, 6), material);
	checkerboard.material.onBeforeCompile = alphaFog;
	checkerboard.rotation.x = -Math.PI * 0.5;
	group.add(checkerboard);

	return group;

}
