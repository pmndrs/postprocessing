import { BoxBufferGeometry, Group, Mesh, MeshBasicMaterial } from "three";

/**
 * Creates a cubic cage.
 *
 * @private
 * @param {Number} color - The color.
 * @param {Number} size - The side length.
 * @param {Number} thickness - The line thickness.
 * @return {Group} The cage.
 */

function create(color, size, thickness) {

	const group = new Group();
	const halfSize = size * 0.5;

	const mesh = new Mesh(
		new BoxBufferGeometry(thickness, size + thickness, thickness),
		new MeshBasicMaterial({ color })
	);

	const clone0 = group.clone();

	let clone = mesh.clone();
	clone.position.set(-halfSize, 0, halfSize);
	clone0.add(clone);

	clone = mesh.clone();
	clone.position.set(halfSize, 0, halfSize);
	clone0.add(clone);

	clone = mesh.clone();
	clone.position.set(-halfSize, 0, -halfSize);
	clone0.add(clone);

	clone = mesh.clone();
	clone.position.set(halfSize, 0, -halfSize);
	clone0.add(clone);

	const clone1 = clone0.clone();
	clone1.rotation.set(Math.PI / 2, 0, 0);

	const clone2 = clone0.clone();
	clone2.rotation.set(0, 0, Math.PI / 2);

	group.add(clone0);
	group.add(clone1);
	group.add(clone2);

	return group;

}

/**
 * A cubic cage.
 */

export class Cage {

	/**
	 * Creates a cubic cage.
	 *
	 * @param {Number} [color=0x000000] - The color.
	 * @param {Number} [size=8.0] - The side length.
	 * @param {Number} [thickness=0.25] - The line thickness.
	 * @return {Group} The cage.
	 */

	static create(color = 0x000000, size = 8.0, thickness = 0.25) {

		return create(color, size, thickness);

	}

}
