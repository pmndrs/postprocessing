import { SphereBufferGeometry, Group, Mesh, MeshPhongMaterial } from "three";

/**
 * Creates a sphere cloud.
 *
 * @param {Number} [amount=100] - The amount of spheres.
 * @param {Number} [range=10.0] - The spread range.
 * @return {Group} The sphere cloud.
 */

export function create(amount = 100, range = 10.0) {

	const group = new Group();
	const geometry = new SphereBufferGeometry(1, 5, 5);
	const twoPI = 2 * Math.PI;

	for(let i = 0; i < amount; ++i) {

		const material = new MeshPhongMaterial({
			color: 0xffffff * Math.random(),
			flatShading: true
		});

		const mesh = new Mesh(geometry, material);
		mesh.position.set(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize();
		mesh.position.multiplyScalar(Math.random() * range);
		mesh.rotation.set(Math.random() * twoPI, Math.random() * twoPI, Math.random() * twoPI);
		mesh.scale.multiplyScalar(Math.random());

		group.add(mesh);

	}

	return group;

}
