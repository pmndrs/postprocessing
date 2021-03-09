import {
	BoxBufferGeometry,
	ConeBufferGeometry,
	Group,
	Mesh,
	MeshPhongMaterial,
	OctahedronBufferGeometry,
	SphereBufferGeometry
} from "three";

/**
 * Creates an object cloud.
 *
 * @param {Number} [amount=100] - The amount of spheres.
 * @param {Number} [range=10.0] - The spread range.
 * @return {Group} The sphere cloud.
 */

export function create(amount = 30, range = 10.0) {

	const group = new Group();
	const PI2 = 2 * Math.PI;

	const geometries = [
		new BoxBufferGeometry(1, 1, 1),
		new ConeBufferGeometry(1, 1, 16),
		new OctahedronBufferGeometry(),
		new SphereBufferGeometry(1, 16, 16)
	];

	for(let i = 0, j = 0, l = geometries.length; i < amount; ++i, j = ++j % l) {

		const material = new MeshPhongMaterial({
			color: 0xffffff * Math.random()
		});

		const mesh = new Mesh(geometries[j], material);
		mesh.rotation.set(Math.random() * PI2, Math.random() * PI2, Math.random() * PI2);
		mesh.scale.multiplyScalar(Math.random() + 0.75);

		const phi = Math.random() * PI2;
		const cosTheta = Math.random() * 2.0 - 1.0;
		const u = Math.random();

		const theta = Math.acos(cosTheta);
		const r = Math.cbrt(u) * range;

		mesh.position.set(
			r * Math.sin(theta) * Math.cos(phi),
			r * Math.sin(theta) * Math.sin(phi),
			r * Math.cos(theta)
		);

		group.add(mesh);

	}

	return group;

}
