import { Mesh, Object3D, Texture } from "three";

/**
 * Sets the anisotropy of all textures used by a given object.
 *
 * @param object - An object.
 * @param anisotropy - The anisotropy.
 */

export function setAnisotropy(object: Object3D, anisotropy: number): void {

	object.traverse((node) => {

		if(!(node instanceof Mesh) || node.material === undefined || node.material === null) {

			return;

		}

		const mesh = node as Mesh;
		const textures = Object.values(mesh.material)
			.filter(x => (x instanceof Texture && !x.isRenderTargetTexture)) as Texture[];

		for(const texture of textures) {

			texture.anisotropy = anisotropy;

		}

	});

}
