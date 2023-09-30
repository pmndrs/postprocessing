import {
	Color,
	DataTexture,
	Group,
	LinearFilter,
	LinearMipMapLinearFilter,
	Mesh,
	MeshStandardMaterial,
	PlaneGeometry,
	RepeatWrapping,
	SRGBColorSpace
} from "three";

import { alphaFog } from "../utils";

/**
 * Creates the environment.
 *
 * @return The mesh.
 */

export function createEnvironment(): Group {

	const planeSize = 5000;

	const colors = [
		new Color(0xffffff), new Color(0x000000),
		new Color(0x000000), new Color(0xffffff)
	];

	const data = new Uint8Array(colors.length * 4);

	for(let i = 0, j = 0, l = colors.length; i < l; ++i) {

		const color = colors[i];
		data[j++] = color.r * 255;
		data[j++] = color.g * 255;
		data[j++] = color.b * 255;
		data[j++] = 255;

	}

	const map = new DataTexture(data, 2, 2);
	map.generateMipmaps = true;
	map.minFilter = LinearMipMapLinearFilter;
	map.magFilter = LinearFilter;
	map.wrapS = RepeatWrapping;
	map.wrapT = RepeatWrapping;
	map.colorSpace = SRGBColorSpace;
	map.repeat.setScalar(planeSize);
	map.anisotropy = 4;

	const group = new Group();
	const material = new MeshStandardMaterial({
		transparent: true,
		roughness: 0.01,
		metalness: 0,
		map
	});

	const checkerboard = new Mesh(new PlaneGeometry(planeSize, planeSize, 6, 6), material);
	checkerboard.material.onBeforeCompile = alphaFog;
	checkerboard.rotation.x = -Math.PI * 0.5;
	group.add(checkerboard);

	return group;

}
