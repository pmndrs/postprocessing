import {
	AmbientLight,
	DoubleSide,
	Fog,
	Group,
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
 * Creates fog.
 *
 * @return The fog, or null if this environment has no fog.
 */

export function createFog(): Fog {

	return new Fog(0x000000, 15, 60);

}

/**
 * Creates the environment.
 *
 * @return The environment.
 */

export function createEnvironment(): Group {

	const planeSize = 5000;
	const image = new Image();
	const map = new Texture(image);
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

	const checkerboard = new Mesh(new PlaneGeometry(1, 1, 6, 6), material);
	checkerboard.name = "Checkeboard";
	checkerboard.material.onBeforeCompile = alphaFog;
	checkerboard.material.side = DoubleSide;
	checkerboard.rotation.x = -Math.PI * 0.5;
	checkerboard.scale.set(planeSize, planeSize, 1);
	group.add(checkerboard);

	return group;

}
